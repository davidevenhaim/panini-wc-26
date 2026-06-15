"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/iconify";
import { Typography } from "@/components/ui/typography";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";

export type AnnouncementBannerProps = {
  storageKey: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

export function AnnouncementBanner({
  storageKey,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: AnnouncementBannerProps) {
  const t = useTranslations();
  const { state, setField } = useLocalStorage<{ dismissed: boolean }>(storageKey, {
    dismissed: false,
  });

  if (state.dismissed) return null;

  const resolvedActionLabel = actionLabel ?? t("announcementBanner.learnMore");

  return (
    <div
      role="region"
      aria-label={t("announcementBanner.regionAria")}
      className={cn(
        "bg-primary/5 border-primary/20 flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="min-w-0 space-y-1">
        <Typography variant="label2" as="p" className="text-foreground">
          {title}
        </Typography>
        {description && (
          <Typography variant="caption1" as="p" color="muted">
            {description}
          </Typography>
        )}
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {onAction && (
          <Button type="button" size="sm" variant="outline" onClick={onAction}>
            <Typography variant="label2" as="span">
              {resolvedActionLabel}
            </Typography>
          </Button>
        )}
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label={t("announcementBanner.dismissAria")}
          onClick={() => setField("dismissed", true)}
        >
          <Iconify icon="lucide:x" className="size-4" />
        </Button>
      </div>
    </div>
  );
}
