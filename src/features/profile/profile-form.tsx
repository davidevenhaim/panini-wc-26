"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/iconify";
import { Typography } from "@/components/ui/typography";
import { LogoutButton } from "@/features/auth-supabase";
import { toastError, toastSuccess } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { upsertProfile } from "@/lib/album/supabase-sync";
import {
  CONTACT_METHODS,
  USERNAME_REGEX,
  type ContactMethod,
  type Profile,
} from "@/types/profile.types";
import { contactLabel } from "@/lib/album/contact";
import WEB_ROUTES from "@/constants/web-routes.constants";

type Props = {
  userId: string;
  initialProfile: Profile | null;
  defaultUsername: string;
};

export function ProfileForm({ userId, initialProfile, defaultUsername }: Props) {
  const t = useTranslations();
  const router = useRouter();
  const [username, setUsername] = React.useState(initialProfile?.username ?? defaultUsername);
  const [displayName, setDisplayName] = React.useState(initialProfile?.display_name ?? "");
  const [bio, setBio] = React.useState(initialProfile?.bio ?? "");
  const [method, setMethod] = React.useState<ContactMethod>(
    initialProfile?.contact_method ?? "whatsapp"
  );
  const [value, setValue] = React.useState(initialProfile?.contact_value ?? "");
  const [saving, setSaving] = React.useState(false);

  const usernameValid = USERNAME_REGEX.test(username);
  const shareUrl = usernameValid
    ? typeof window !== "undefined"
      ? `${window.location.origin}${WEB_ROUTES.USER_SHARE(username)}`
      : ""
    : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameValid) {
      toastError(t("profile.invalidUsername"));
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();
      await upsertProfile(supabase, userId, {
        username,
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
        contact_method: method,
        contact_value: value.trim() || null,
      });
      toastSuccess(t("profile.saved"));
      router.refresh();
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : String(err);
      if (message.includes("duplicate") || message.includes("unique")) {
        toastError(t("profile.usernameTaken"));
      } else {
        toastError(t("profile.saveFailed"), message);
      }
    } finally {
      setSaving(false);
    }
  };

  const copyShareLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toastSuccess(t("profile.copied"));
    } catch {
      toastError(t("profile.copyFailed"));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <header>
        <Typography variant="h6" as="h1" className="text-2xl font-extrabold">
          {t("profile.title")}
        </Typography>
        <Typography variant="caption2" as="p" color="muted">
          {t("profile.subtitle")}
        </Typography>
      </header>

      <div className="space-y-2">
        <label className="block">
          <span className="text-foreground/60 mb-1 block text-xs font-bold tracking-wider uppercase">
            {t("profile.usernameLabel")}
          </span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
            maxLength={20}
            className={cn(
              "bg-card h-11 w-full rounded-2xl border px-3 font-mono text-sm outline-none",
              "focus-visible:ring-ring/40 focus-visible:ring-2",
              !usernameValid && username.length > 0 && "border-red-500"
            )}
            placeholder="e.g. david_panini"
            required
          />
          <span className="text-foreground/60 mt-1 block text-xs">{t("profile.usernameHint")}</span>
        </label>
      </div>

      <div className="space-y-2">
        <label className="block">
          <span className="text-foreground/60 mb-1 block text-xs font-bold tracking-wider uppercase">
            {t("profile.displayNameLabel")}
          </span>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={60}
            className="bg-card focus-visible:ring-ring/40 h-11 w-full rounded-2xl border px-3 text-sm outline-none focus-visible:ring-2"
          />
        </label>
      </div>

      <div className="space-y-2">
        <label className="block">
          <span className="text-foreground/60 mb-1 block text-xs font-bold tracking-wider uppercase">
            {t("profile.bioLabel")}
          </span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={200}
            rows={2}
            className="bg-card focus-visible:ring-ring/40 w-full rounded-2xl border p-3 text-sm outline-none focus-visible:ring-2"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
        <label className="block">
          <span className="text-foreground/60 mb-1 block text-xs font-bold tracking-wider uppercase">
            {t("profile.contactMethodLabel")}
          </span>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as ContactMethod)}
            className="bg-card focus-visible:ring-ring/40 h-11 w-full rounded-2xl border px-3 text-sm outline-none focus-visible:ring-2"
          >
            {CONTACT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m === "none" ? t("profile.contactNone") : contactLabel(m)}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-foreground/60 mb-1 block text-xs font-bold tracking-wider uppercase">
            {t("profile.contactValueLabel")}
          </span>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={
              method === "whatsapp" || method === "phone"
                ? "+972501234567"
                : method === "telegram" || method === "instagram"
                  ? "@handle"
                  : method === "email"
                    ? "you@example.com"
                    : ""
            }
            disabled={method === "none"}
            className="bg-card focus-visible:ring-ring/40 h-11 w-full rounded-2xl border px-3 text-sm outline-none focus-visible:ring-2 disabled:opacity-50"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" loading={saving}>
          <Iconify icon="lucide:save" className="size-4" />
          {t("save")}
        </Button>
        <LogoutButton variant="outline" />
      </div>

      {initialProfile && shareUrl && (
        <div className="rounded-2xl border bg-gradient-to-br from-emerald-50 to-sky-50 p-4 dark:from-emerald-950/30 dark:to-sky-950/30">
          <Typography
            variant="overline"
            as="span"
            className="text-foreground/60 mb-1 block text-[10px] font-bold tracking-wider uppercase"
          >
            {t("profile.shareLink")}
          </Typography>
          <div className="flex flex-wrap items-center gap-2">
            <code className="bg-background/80 flex-1 rounded-xl px-3 py-2 font-mono text-xs break-all">
              {shareUrl}
            </code>
            <Button type="button" variant="outline" size="sm" onClick={copyShareLink}>
              <Iconify icon="lucide:copy" className="size-4" />
              {t("profile.copy")}
            </Button>
            <Button type="button" size="sm" asChild>
              <a href={shareUrl} target="_blank" rel="noreferrer">
                <Iconify icon="lucide:external-link" className="size-4" />
                {t("profile.openShare")}
              </a>
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
