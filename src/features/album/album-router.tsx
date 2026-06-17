"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useLocalizedText } from "@/hooks/use-localized-text";
import Iconify from "@/components/ui/iconify";
import { Typography } from "@/components/ui/typography";
import type { Album } from "@/collections/schema";
import { useCollectionStore } from "@/store/collection.store";
import { AlbumNavBar } from "./album-nav-bar";
import { AlbumPage } from "./album-page";
import { GenericAlbumPage } from "./generic/generic-album-page";
import { GroupedAlbumPage } from "./generic/grouped-album-page";
import { AdrenalynAlbumPage } from "./generic/adrenalyn-album-page";
import { ReportButton } from "@/features/data-reports/report-button";

type Props = {
  album: Album;
  /** Optional slot — used by the WC26 page to embed the collectors directory. */
  collectors?: React.ReactNode;
};

export function AlbumRouter({ album, collectors }: Props) {
  const hydrate = useCollectionStore((s) => s.hydrate);
  const setActiveAlbum = useCollectionStore((s) => s.setActiveAlbum);

  React.useEffect(() => {
    hydrate();
    setActiveAlbum(album.id);
  }, [album.id, hydrate, setActiveAlbum]);

  if (album.layout === "world-cup-grouped") {
    return (
      <>
        <AlbumNavBar album={album} />
        <AlbumPage collectors={collectors} />
      </>
    );
  }
  if (album.layout === "world-cup-flat-grouped") {
    return (
      <>
        <AlbumNavBar album={album} />
        <GroupedAlbumPage album={album} />
      </>
    );
  }
  if (album.layout === "adrenalyn-sections") {
    return (
      <>
        <AlbumNavBar album={album} />
        <AdrenalynAlbumPage album={album} />
      </>
    );
  }
  if (album.layout === "flat-sections" || album.layout === "team-grid") {
    return (
      <>
        <AlbumNavBar album={album} />
        <GenericAlbumPage album={album} />
      </>
    );
  }
  return <MetadataOnlyView album={album} />;
}

function MetadataOnlyView({ album }: { album: Album }) {
  const t = useTranslations();
  const lt = useLocalizedText();
  return (
    <>
      <AlbumNavBar album={album} />
      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-10">
        <header
          className="overflow-hidden rounded-3xl p-8 text-white shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${album.theme.primary}, ${album.theme.accent ?? album.theme.secondary ?? album.theme.primary})`,
          }}
        >
          <Typography
            variant="overline"
            as="span"
            className="text-[11px] font-bold tracking-[0.18em] text-white/80 uppercase"
          >
            {album.publisher ?? t("library.unknownPublisher")} · {album.season ?? "—"}
          </Typography>
          <Typography variant="h6" as="h1" className="font-heading mt-1 text-3xl font-black">
            {lt(album.title)}
          </Typography>
        </header>

        <section className="bg-card mt-6 rounded-3xl border-2 border-dashed p-6 text-center shadow-sm">
          <Iconify icon="lucide:scroll-text" className="text-foreground/30 mx-auto size-10" />
          <Typography variant="h6" as="h2" className="font-heading mt-2 text-xl font-extrabold">
            {t("library.checklistMissing")}
          </Typography>
          <Typography variant="caption2" as="p" color="muted" className="mt-1">
            {t("library.checklistMissingDescription")}
          </Typography>
        </section>

        {album.sourceNotes && album.sourceNotes.length > 0 && (
          <section className="bg-muted/30 mt-6 rounded-2xl border p-4">
            <Typography
              variant="overline"
              as="span"
              className="text-foreground/60 text-[10px] font-bold tracking-wider uppercase"
            >
              {t("library.sourceNotes")}
            </Typography>
            <ul className="text-foreground/70 mt-2 list-disc space-y-1 ps-5 text-xs">
              {album.sourceNotes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="bg-muted/20 mt-6 rounded-2xl border p-4">
          <Typography variant="caption2" as="p" color="muted">
            {t("dataReport.communityNotice")}
          </Typography>
          <div className="mt-3">
            <ReportButton
              variant="outline"
              context={{
                albumId: album.id,
                albumTitle: lt(album.title),
                itemType: album.itemType,
              }}
            />
          </div>
        </section>
      </main>
    </>
  );
}
