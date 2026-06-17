"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import Iconify from "@/components/ui/iconify";
import { Progress } from "@/components/ui/progress";
import { Typography } from "@/components/ui/typography";
import type { Album } from "@/collections/schema";
import { albumProgressForQuantities } from "@/lib/album/album-progress";
import type { Quantities } from "@/lib/album/collection";

type Props = {
  album: Album;
  quantities: Quantities;
};

export function GenericProgressSummary({ album, quantities }: Props) {
  const t = useTranslations();
  const stats = albumProgressForQuantities(album, quantities);
  const isPartial = album.dataStatus === "verified-partial";
  const isMetadataOnly = album.dataStatus === "metadata-only";
  const primary = album.theme.primary;
  const accent = album.theme.accent ?? album.theme.secondary ?? primary;

  if (isMetadataOnly) {
    return (
      <section className="bg-card rounded-3xl border-2 border-dashed p-5 text-center">
        <Iconify icon="lucide:scroll-text" className="text-foreground/30 mx-auto size-8" />
        <Typography variant="body2" as="p" color="muted" className="mt-1">
          {t("library.checklistComingSoon")}
        </Typography>
      </section>
    );
  }

  return (
    <section
      className="relative overflow-hidden rounded-3xl p-5 text-white shadow-lg"
      style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
    >
      <Typography
        variant="overline"
        as="p"
        className="text-[11px] font-bold tracking-[0.18em] text-white/80 uppercase"
      >
        {isPartial ? t("album.stats.partialTrackedHeader") : t("album.stats.albumProgress")}
      </Typography>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-heading text-5xl leading-none font-black">{stats.unique}</span>
        <span className="font-mono text-sm font-semibold text-white/70">/ {stats.total}</span>
        {!isPartial && (
          <span className="ms-auto rounded-full bg-white/15 px-2.5 py-0.5 font-mono text-sm font-bold backdrop-blur-sm">
            {stats.percent}%
          </span>
        )}
      </div>
      {!isPartial && <Progress value={stats.percent} className="mt-3 h-3 bg-white/20" />}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/85">
        <span className="inline-flex items-center gap-1">
          <Iconify icon="lucide:check-circle" className="size-3.5" />
          {stats.unique} {t("album.stats.unique")}
        </span>
        <span className="inline-flex items-center gap-1">
          <Iconify icon="lucide:square-dashed" className="size-3.5" />
          {stats.missing} {t("album.stats.missing")}
        </span>
        <span className="inline-flex items-center gap-1">
          <Iconify icon="lucide:copy" className="size-3.5" />
          {stats.duplicates} {t("album.stats.duplicates")}
        </span>
      </div>
      {isPartial && (
        <Typography
          variant="caption2"
          as="p"
          className="mt-3 rounded-xl bg-white/15 px-3 py-2 text-[11px] text-white"
        >
          {t("album.stats.partialNotice")}
        </Typography>
      )}
    </section>
  );
}
