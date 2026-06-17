"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import Iconify from "@/components/ui/iconify";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Album, CollectionFamily } from "@/collections/schema";
import { useCollectionStore } from "@/store/collection.store";
import { useLocalizedText } from "@/hooks/use-localized-text";
import { computeLibraryProgress } from "@/lib/album/library-progress";
import { AlbumCard } from "./album-card";
import { LibraryProgressSummary } from "./library-progress-summary";

type Props = {
  families: CollectionFamily[];
  albums: Album[];
  collectors?: React.ReactNode;
};

type Filter = "all" | "verified" | "metadata-only" | "in-progress";

export function LibraryPage({ families, albums, collectors }: Props) {
  const t = useTranslations();
  const lt = useLocalizedText();
  const hydrate = useCollectionStore((s) => s.hydrate);
  const isHydrated = useCollectionStore((s) => s.isHydrated);
  const library = useCollectionStore((s) => s.library);
  const recentlyOpenedIds = useCollectionStore((s) => s.library.recentlyOpenedAlbumIds);
  const getAlbumQuantities = useCollectionStore((s) => s.getAlbumQuantities);

  const [filter, setFilter] = React.useState<Filter>("all");
  const [familyFilter, setFamilyFilter] = React.useState<string>("all");

  React.useEffect(() => {
    hydrate();
  }, [hydrate]);

  const libraryStats = React.useMemo(
    () => computeLibraryProgress(albums, (albumId) => library.albums[albumId]?.quantities ?? {}),
    [albums, library]
  );

  const recent = isHydrated
    ? recentlyOpenedIds.map((id) => albums.find((a) => a.id === id)).filter((a): a is Album => !!a)
    : [];

  const filteredAlbums = albums.filter((album) => {
    if (familyFilter !== "all" && album.familyId !== familyFilter) return false;
    if (filter === "all") return true;
    if (filter === "verified") return album.dataStatus === "verified-complete";
    if (filter === "metadata-only") return album.dataStatus === "metadata-only";
    if (filter === "in-progress") {
      const q = getAlbumQuantities(album.id);
      return Object.keys(q).length > 0;
    }
    return true;
  });

  return (
    <main
      className={cn(
        "mx-auto min-h-svh w-full px-4 pt-4 pb-16 sm:px-6 sm:pt-6 lg:px-10",
        "from-background via-background bg-gradient-to-b to-emerald-50/40 dark:to-emerald-950/20"
      )}
    >
      {isHydrated ? (
        <LibraryProgressSummary {...libraryStats} />
      ) : (
        <div className="bg-card/50 h-40 animate-pulse rounded-3xl border" aria-hidden />
      )}

      {collectors}

      <section className="mt-6 border-t pt-6">
        <header className="mb-4">
          <Typography
            variant="overline"
            as="span"
            className="text-foreground/50 block text-[10px] font-bold tracking-[0.18em] uppercase"
          >
            {t("library.myAlbumsEyebrow")}
          </Typography>
          <Typography variant="h6" as="h2" className="font-heading text-xl font-black sm:text-2xl">
            {t("library.myAlbumsTitle")}
          </Typography>
          <Typography variant="caption2" as="p" color="muted" className="mt-1 max-w-prose">
            {t("library.subtitle")}
          </Typography>
        </header>

        {recent.length > 0 && (
          <section className="mb-6">
            <Typography
              variant="overline"
              as="span"
              className="text-foreground/50 mb-3 block text-[10px] font-bold tracking-[0.18em] uppercase"
            >
              {t("library.continueCollecting")}
            </Typography>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recent.slice(0, 3).map((a) => (
                <AlbumCard key={a.id} album={a} />
              ))}
            </div>
          </section>
        )}

        <section className="mb-3 flex flex-wrap gap-2">
          {[
            { id: "all", label: t("library.filterAll") },
            { id: "in-progress", label: t("library.filterInProgress") },
            { id: "verified", label: t("library.filterVerified") },
            { id: "metadata-only", label: t("library.filterMetadataOnly") },
          ].map((opt) => (
            <Button
              key={opt.id}
              variant={filter === opt.id ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => setFilter(opt.id as Filter)}
            >
              {opt.label}
            </Button>
          ))}
        </section>

        <section className="mb-6 flex flex-wrap gap-2">
          <Button
            variant={familyFilter === "all" ? "secondary" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => setFamilyFilter("all")}
          >
            <Iconify icon="lucide:layout-grid" className="size-3.5" />
            {t("all")}
          </Button>
          {families.map((f) => (
            <Button
              key={f.id}
              variant={familyFilter === f.id ? "secondary" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => setFamilyFilter(f.id)}
            >
              {lt(f.name)}
            </Button>
          ))}
        </section>

        <section className="space-y-8">
          {families
            .filter((f) => familyFilter === "all" || f.id === familyFilter)
            .map((family) => {
              const familyAlbums = filteredAlbums.filter((a) => a.familyId === family.id);
              if (familyAlbums.length === 0) return null;
              return (
                <div key={family.id}>
                  <div className="mb-3 flex items-end justify-between gap-3">
                    <div>
                      <Typography
                        variant="h6"
                        as="h3"
                        className="font-heading text-xl font-extrabold"
                      >
                        {lt(family.name)}
                      </Typography>
                      {family.description && (
                        <Typography variant="caption2" as="p" color="muted">
                          {lt(family.description)}
                        </Typography>
                      )}
                    </div>
                    <Link
                      href={`/collections/${family.slug}`}
                      className="text-foreground/60 hover:text-foreground inline-flex items-center gap-1 text-xs font-semibold"
                    >
                      {t("library.viewFamily")}
                      <Iconify icon="lucide:arrow-right" className="size-3.5" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {familyAlbums.map((a) => (
                      <AlbumCard key={a.id} album={a} />
                    ))}
                  </div>
                </div>
              );
            })}
        </section>
      </section>
    </main>
  );
}
