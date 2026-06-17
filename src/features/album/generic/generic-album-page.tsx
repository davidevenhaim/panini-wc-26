"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/iconify";
import { Typography } from "@/components/ui/typography";
import { useLocalizedText } from "@/hooks/use-localized-text";
import { useBoolean } from "@/hooks/use-boolean";
import { useDebounce } from "@/hooks/use-debounce";
import { AreYouSureDialog } from "@/components/ui/are-you-sure-dialog";
import { toastSuccess } from "@/lib/toast";
import { cn } from "@/lib/utils";
import WEB_ROUTES from "@/constants/web-routes.constants";
import type { Album, AlbumSection } from "@/collections/schema";
import { useCollectionStore } from "@/store/collection.store";
import { useSyncWithUser } from "../use-sync-with-user";
import { FilterBar } from "../filter-bar";
import { GenericSectionTile } from "./section-tile";
import { GenericSectionDialog } from "./section-dialog";
import { GenericProgressSummary } from "./generic-progress-summary";
import { ReportButton } from "@/features/data-reports/report-button";
import type { FilterMode } from "../types";

type Props = {
  album: Album;
};

type TeamFilter = "all" | "completed" | "incomplete";

export function GenericAlbumPage({ album }: Props) {
  const t = useTranslations();
  const lt = useLocalizedText();
  const rtl = album.theme.direction === "rtl";

  const hydrate = useCollectionStore((s) => s.hydrate);
  const isHydrated = useCollectionStore((s) => s.isHydrated);
  const quantities = useCollectionStore((s) => s.quantities);
  const resetAll = useCollectionStore((s) => s.resetAll);

  React.useEffect(() => {
    hydrate();
  }, [hydrate]);
  useSyncWithUser();

  const resetConfirm = useBoolean();
  const [filter, setFilter] = React.useState<FilterMode>("all");
  const [teamFilter, setTeamFilter] = React.useState<TeamFilter>("all");
  const [queryRaw, setQueryRaw] = React.useState("");
  const query = useDebounce(queryRaw, 120);
  const lcQuery = React.useMemo(() => query.trim().toLowerCase(), [query]);

  const [selectedSectionId, setSelectedSectionId] = React.useState<string | null>(null);

  const visibleSections = album.sections.filter((section) => {
    const total = section.items.length;
    const owned = section.items.reduce(
      (acc, item) => acc + (((quantities[item.code] ?? 0) as number) >= 1 ? 1 : 0),
      0
    );
    const isComplete = owned === total && total > 0;
    if (teamFilter === "completed" && !isComplete) return false;
    if (teamFilter === "incomplete" && isComplete) return false;

    if (filter !== "all" || lcQuery) {
      const titleEn = section.title.en?.toLowerCase() ?? "";
      const titleHe = section.title.he?.toLowerCase() ?? "";
      const titleMatch = !!lcQuery && (titleEn.includes(lcQuery) || titleHe.includes(lcQuery));
      const anyItem = section.items.some((item) => {
        const qty = (quantities[item.code] ?? 0) as number;
        const filterOk =
          filter === "all" ||
          (filter === "missing" && qty === 0) ||
          (filter === "owned" && qty >= 1) ||
          (filter === "duplicates" && qty >= 2);
        if (!filterOk) return false;
        if (!lcQuery) return true;
        if (item.code.toLowerCase().includes(lcQuery)) return true;
        const player =
          item.playerName?.en?.toLowerCase() ?? item.playerName?.he?.toLowerCase() ?? "";
        return player.includes(lcQuery);
      });
      if (!anyItem && !titleMatch) return false;
    }
    return true;
  });

  const selectedSection: AlbumSection | null =
    album.sections.find((s) => s.id === selectedSectionId) ?? null;

  if (!isHydrated) {
    return (
      <main className="mx-auto w-full px-4 py-10 sm:px-6 lg:px-10">
        <Typography variant="body2" as="p" color="muted" className="text-center">
          {t("loading")}
        </Typography>
      </main>
    );
  }

  return (
    <main
      dir={rtl ? "rtl" : undefined}
      className={cn(
        "mx-auto min-h-svh w-full px-4 pt-4 pb-16 sm:px-6 sm:pt-6 lg:px-10",
        "from-background via-background bg-gradient-to-b"
      )}
      style={{
        backgroundImage: `linear-gradient(to bottom, transparent, transparent 75%, ${album.theme.primary}15)`,
      }}
    >
      <div className="mb-4 flex items-center gap-3">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-md"
          style={{
            background: `linear-gradient(135deg, ${album.theme.primary}, ${album.theme.accent ?? album.theme.primary})`,
          }}
          aria-hidden
        >
          <Iconify icon="lucide:book-open" className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <Typography
            variant="h6"
            as="h1"
            className="font-heading truncate text-lg leading-tight font-extrabold sm:text-xl"
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

      <GenericProgressSummary album={album} quantities={quantities} />

      <div className="mt-4">
        <FilterBar
          filter={filter}
          onFilterChange={setFilter}
          teamFilter={teamFilter}
          onTeamFilterChange={setTeamFilter}
          query={queryRaw}
          onQueryChange={setQueryRaw}
        />
      </div>

      <section className="mt-4">
        {visibleSections.length === 0 ? (
          <div className="bg-card rounded-3xl border p-6 text-center">
            <Typography variant="body2" as="p" color="muted">
              {t("album.search.noMatches")}
            </Typography>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {visibleSections.map((section) => {
              const total = section.items.length;
              const owned = section.items.reduce(
                (acc, item) => acc + (((quantities[item.code] ?? 0) as number) >= 1 ? 1 : 0),
                0
              );
              return (
                <GenericSectionTile
                  key={section.id}
                  section={section}
                  owned={owned}
                  total={total}
                  rtl={rtl}
                  onClick={() => setSelectedSectionId(section.id)}
                />
              );
            })}
          </div>
        )}
      </section>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        <ReportButton
          variant="outline"
          context={{
            albumId: album.id,
            albumTitle: lt(album.title),
            itemType: album.itemType,
          }}
        />
        <Button variant="outline" size="sm" onClick={resetConfirm.onTrue}>
          <Iconify icon="lucide:trash-2" className="size-4" />
          {t("album.menu.reset")}
        </Button>
      </div>

      <GenericSectionDialog
        section={selectedSection}
        albumId={album.id}
        albumTitle={lt(album.title)}
        itemType={album.itemType}
        open={selectedSectionId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedSectionId(null);
        }}
        filter={filter}
        query={query}
        rtl={rtl}
      />

      <AreYouSureDialog
        open={resetConfirm.value}
        onOpenChange={resetConfirm.onToggle}
        onConfirm={() => {
          resetAll();
          toastSuccess(t("album.reset.done"));
        }}
        title={t("album.reset.title")}
        description={t("album.reset.description")}
        okText={t("album.reset.confirm")}
        variant="destructive"
      />
    </main>
  );
}
