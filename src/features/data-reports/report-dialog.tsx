"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/iconify";
import { Typography } from "@/components/ui/typography";
import { usePermissions } from "@/hooks/use-permissions";
import { createClient } from "@/lib/supabase/client";
import { toastError, toastSuccess } from "@/lib/toast";
import { CONFIG } from "@/lib/app-config";
import { insertDataReport } from "./insert";
import {
  DATA_ISSUE_TYPES,
  ReportPayloadSchema,
  type DataIssueType,
  type ReportContext,
} from "./types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: ReportContext;
};

export function ReportDialog({ open, onOpenChange, context }: Props) {
  const t = useTranslations();
  const { user, isAuthenticated, isLoading } = usePermissions();

  const [issueType, setIssueType] = React.useState<DataIssueType>("WRONG_PLAYER_NAME");
  const [description, setDescription] = React.useState("");
  const [suggested, setSuggested] = React.useState("");
  const [sourceUrl, setSourceUrl] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setDescription("");
      setSuggested("");
      setSourceUrl("");
      setIssueType("WRONG_PLAYER_NAME");
    }
  }, [open]);

  if (!CONFIG.isSupabaseConfigured) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("dataReport.title")}</DialogTitle>
            <DialogDescription>{t("dataReport.supabaseRequired")}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  async function onSubmit() {
    if (!isAuthenticated || !user) return;
    const parsed = ReportPayloadSchema.safeParse({
      albumId: context.albumId,
      editionId: context.editionId,
      sectionId: context.sectionId,
      itemCode: context.itemCode,
      issueType,
      description,
      suggestedValue: suggested,
      sourceUrl,
    });
    if (!parsed.success) {
      toastError(t("dataReport.invalid"));
      return;
    }
    setSubmitting(true);
    try {
      const supabase = createClient();
      await insertDataReport(supabase, user.id, parsed.data);
      toastSuccess(t("dataReport.thanks"));
      onOpenChange(false);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") console.error("[dataReport]", err);
      toastError(t("dataReport.failed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Iconify icon="lucide:flag" className="size-5" />
            {t("dataReport.title")}
          </DialogTitle>
          <DialogDescription>{t("dataReport.subtitle")}</DialogDescription>
        </DialogHeader>

        <div className="bg-muted/40 rounded-xl p-3 text-xs">
          <ContextRow
            label={t("dataReport.contextAlbum")}
            value={context.albumTitle ?? context.albumId}
          />
          {context.sectionTitle && (
            <ContextRow label={t("dataReport.contextSection")} value={context.sectionTitle} />
          )}
          {context.itemCode && (
            <ContextRow
              label={
                context.itemType === "CARD"
                  ? t("dataReport.contextCard")
                  : t("dataReport.contextItem")
              }
              value={
                context.itemTitle ? `${context.itemCode} — ${context.itemTitle}` : context.itemCode
              }
            />
          )}
        </div>

        {isLoading ? (
          <Typography variant="body2" as="p" color="muted">
            {t("loading")}
          </Typography>
        ) : !isAuthenticated ? (
          <Typography variant="body2" as="p" color="muted">
            {t("dataReport.signInRequired")}
          </Typography>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void onSubmit();
            }}
            className="space-y-3"
          >
            <label className="block text-xs font-bold">
              {t("dataReport.issueTypeLabel")}
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value as DataIssueType)}
                className="bg-card focus:ring-foreground/20 mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
              >
                {DATA_ISSUE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t(`dataReport.issueTypes.${type}`)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs font-bold">
              {t("dataReport.descriptionLabel")}
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                minLength={4}
                maxLength={2000}
                rows={4}
                placeholder={t("dataReport.descriptionPlaceholder")}
                className="bg-card focus:ring-foreground/20 mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
              />
            </label>

            <label className="block text-xs font-bold">
              {t("dataReport.suggestedLabel")}
              <input
                value={suggested}
                onChange={(e) => setSuggested(e.target.value)}
                maxLength={500}
                placeholder={t("dataReport.suggestedPlaceholder")}
                className="bg-card focus:ring-foreground/20 mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
              />
            </label>

            <label className="block text-xs font-bold">
              {t("dataReport.sourceUrlLabel")}
              <input
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                inputMode="url"
                placeholder="https://..."
                className="bg-card focus:ring-foreground/20 mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
              />
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={submitting || description.trim().length < 4}>
                {submitting ? t("loading") : t("dataReport.submit")}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ContextRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-foreground/60 min-w-24 font-semibold">{label}</span>
      <span className="truncate">{value}</span>
    </div>
  );
}
