"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import Iconify from "@/components/ui/iconify";
import { Typography } from "@/components/ui/typography";
import type { Album } from "@/collections/schema";
import { ISRAEL_FAMILY } from "@/data/israel/family";
import { IsraelAlbumGrid } from "./israel-album-grid";

type Props = {
  modern: Album[];
  legacy: Album[];
  chronological: boolean;
};

function matches(album: Album, q: string): boolean {
  if (!q) return true;
  const haystack = [
    album.title.en,
    album.title.he,
    album.shortTitle?.en,
    album.shortTitle?.he,
    album.season,
    album.publisher,
    String(album.year ?? ""),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

export function IsraelLibraryView({ modern, legacy, chronological }: Props) {
  const t = useTranslations();
  const [query, setQuery] = React.useState("");
  const lcQuery = query.trim().toLowerCase();

  const filteredModern = React.useMemo(
    () => modern.filter((a) => matches(a, lcQuery)),
    [modern, lcQuery]
  );
  const filteredLegacy = React.useMemo(
    () => legacy.filter((a) => matches(a, lcQuery)),
    [legacy, lcQuery]
  );

  const nothing = filteredModern.length === 0 && filteredLegacy.length === 0;

  return (
    <>
      <div className="mb-6">
        <div className="relative max-w-md">
          <span
            className="text-foreground/40 pointer-events-none absolute inset-y-0 start-3 flex items-center"
            aria-hidden
          >
            <Iconify icon="lucide:search" className="size-4" />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("israel.searchPlaceholder")}
            aria-label={t("israel.searchPlaceholder")}
            className="bg-card focus:ring-foreground/20 w-full rounded-full border py-2 ps-9 pe-3 text-sm shadow-sm focus:ring-2 focus:outline-none"
          />
        </div>
      </div>

      {nothing && (
        <div className="bg-card mb-6 rounded-3xl border-2 border-dashed p-6 text-center">
          <Iconify icon="lucide:search-x" className="text-foreground/30 mx-auto size-8" />
          <Typography variant="body2" as="p" color="muted" className="mt-1">
            {t("israel.searchEmpty")}
          </Typography>
        </div>
      )}

      {filteredModern.length > 0 && (
        <section className="mb-10">
          <SectionHeader
            icon="lucide:sparkles"
            eyebrow={t("israel.modernEyebrow")}
            title={t("israel.modernTitle")}
            subtitle={t("israel.modernSubtitle")}
            color={ISRAEL_FAMILY.theme.primary}
          />
          <IsraelAlbumGrid albums={filteredModern} chronological={chronological} />
        </section>
      )}

      {filteredLegacy.length > 0 && (
        <section>
          <SectionHeader
            icon="lucide:history"
            eyebrow={t("israel.legacyEyebrow")}
            title={t("israel.legacyTitle")}
            subtitle={t("israel.legacySubtitle")}
            color={ISRAEL_FAMILY.theme.secondary ?? ISRAEL_FAMILY.theme.primary}
          />
          <IsraelAlbumGrid albums={filteredLegacy} chronological={chronological} />
        </section>
      )}
    </>
  );
}

function SectionHeader({
  icon,
  eyebrow,
  title,
  subtitle,
  color,
}: {
  icon: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  color: string;
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-md"
        style={{ backgroundColor: color }}
        aria-hidden
      >
        <Iconify icon={icon} className="size-6" />
      </span>
      <div className="min-w-0">
        <Typography
          variant="overline"
          as="span"
          className="text-foreground/50 block text-[10px] font-bold tracking-[0.18em] uppercase"
        >
          {eyebrow}
        </Typography>
        <Typography variant="h6" as="h2" className="font-heading text-2xl font-extrabold">
          {title}
        </Typography>
        <Typography variant="caption2" as="p" color="muted">
          {subtitle}
        </Typography>
      </div>
    </div>
  );
}
