"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import Iconify from "@/components/ui/iconify";
import { Typography } from "@/components/ui/typography";
import WEB_ROUTES from "@/constants/web-routes.constants";
import type { Album } from "@/collections/schema";
import { useCollectionStore } from "@/store/collection.store";
import { useLocalizedText } from "@/hooks/use-localized-text";
import { albumProgressForQuantities, type AlbumProgress } from "@/lib/album/album-progress";
import { cn } from "@/lib/utils";

type Props = {
  album: Album;
  className?: string;
};

const STATUS_VARIANT: Record<Album["dataStatus"], { label: string; tone: string; icon: string }> = {
  "verified-complete": {
    label: "library.statusVerifiedComplete",
    tone: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/30 dark:text-emerald-300",
    icon: "lucide:badge-check",
  },
  "verified-partial": {
    label: "library.statusVerifiedPartial",
    tone: "bg-amber-500/15 text-amber-700 ring-amber-500/30 dark:text-amber-300",
    icon: "lucide:badge-info",
  },
  "metadata-only": {
    label: "library.statusMetadataOnly",
    tone: "bg-foreground/10 text-foreground/70 ring-foreground/15",
    icon: "lucide:scroll-text",
  },
};

export function AlbumCard({ album, className }: Props) {
  const t = useTranslations();
  const lt = useLocalizedText();
  const isHydrated = useCollectionStore((s) => s.isHydrated);
  const getAlbumQuantities = useCollectionStore((s) => s.getAlbumQuantities);
  const quantities = isHydrated ? getAlbumQuantities(album.id) : {};
  const progress: AlbumProgress = albumProgressForQuantities(album, quantities);

  const status = STATUS_VARIANT[album.dataStatus];
  const isMetadataOnly = album.dataStatus === "metadata-only";

  return (
    <Link
      href={WEB_ROUTES.ALBUM(album.slug)}
      className={cn(
        "group bg-card relative overflow-hidden rounded-3xl border p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg",
        className
      )}
      style={{ borderColor: `${album.theme.primary}40` }}
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-1.5"
        style={{
          background: `linear-gradient(90deg, ${album.theme.primary}, ${album.theme.accent ?? album.theme.primary})`,
        }}
      />

      <div className="flex items-start gap-3">
        <span
          className="font-heading flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl font-black text-white shadow-sm"
          style={{
            background: `linear-gradient(135deg, ${album.theme.primary}, ${album.theme.accent ?? album.theme.primary})`,
          }}
          aria-hidden
        >
          {(lt(album.shortTitle) || lt(album.title)).charAt(0) || "?"}
        </span>
        <div className="min-w-0 flex-1">
          <Typography
            variant="h6"
            as="h3"
            className="font-heading truncate text-base leading-tight font-extrabold"
          >
            {lt(album.title)}
          </Typography>
          <Typography variant="caption2" as="p" color="muted" className="truncate">
            {album.publisher && album.season
              ? `${album.publisher} · ${album.season}`
              : (album.season ?? album.publisher ?? "")}
          </Typography>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1",
            status.tone
          )}
        >
          <Iconify icon={status.icon} className="size-3" />
          {t(status.label)}
        </span>
        {album.itemType !== "STICKER" && (
          <span className="bg-foreground/10 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase">
            {album.itemType.toLowerCase()}
          </span>
        )}
      </div>

      {!isMetadataOnly && (
        <>
          <div className="mt-3 flex items-baseline justify-between gap-3">
            <Typography
              variant="overline"
              as="span"
              className="text-foreground/50 text-[10px] font-bold tracking-wider uppercase"
            >
              {t("album.stats.albumProgress")}
            </Typography>
            <span className="font-mono text-sm font-bold tabular-nums">
              {progress.unique}/{progress.total}
            </span>
          </div>
          <div className="bg-foreground/10 mt-1 h-1.5 w-full overflow-hidden rounded-full">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress.percent}%`,
                background: `linear-gradient(90deg, ${album.theme.primary}, ${album.theme.accent ?? album.theme.primary})`,
              }}
            />
          </div>
          <div className="text-foreground/60 mt-2 flex gap-3 text-[11px]">
            <span>{progress.percent}%</span>
            {progress.duplicates > 0 && (
              <span className="text-amber-600 dark:text-amber-400">+{progress.duplicates}</span>
            )}
          </div>
        </>
      )}

      {isMetadataOnly && (
        <p className="text-foreground/60 mt-3 text-xs">{t("library.checklistMissing")}</p>
      )}
    </Link>
  );
}
