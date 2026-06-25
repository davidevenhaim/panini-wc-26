"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/iconify";
import { Typography } from "@/components/ui/typography";
import { AreYouSureDialog } from "@/components/ui/are-you-sure-dialog";
import { useBoolean } from "@/hooks/use-boolean";
import { useDebounce } from "@/hooks/use-debounce";
import { useLocalizedText } from "@/hooks/use-localized-text";
import { toastSuccess } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { Album, AlbumSection } from "@/collections/schema";
import { useCollectionStore } from "@/store/collection.store";
import { useSyncWithUser } from "../use-sync-with-user";
import { FilterBar } from "../filter-bar";
import { GenericSectionDialog } from "./section-dialog";
import { GenericSectionTile } from "./section-tile";
import { GenericProgressSummary } from "./generic-progress-summary";
import { TeamTileSection } from "./team-tile-section";
import { ReportButton } from "@/features/data-reports/report-button";
import { AlbumShareCopyButton } from "../album-share-copy-button";
import type { FilterMode } from "../types";

type Props = { album: Album };

type TeamFilter = "all" | "completed" | "incomplete";

function sectionMatchesSearch(section: AlbumSection, lcQuery: string): boolean {
  if (!lcQuery) return true;
  const en = section.title.en?.toLowerCase() ?? "";
  const he = section.title.he?.toLowerCase() ?? "";
  const badge = section.badge?.toLowerCase() ?? "";
  if (en.includes(lcQuery) || he.includes(lcQuery) || badge.includes(lcQuery)) return true;
  return section.items.some((item) => {
    if (item.code.toLowerCase().includes(lcQuery)) return true;
    const player = item.playerName?.en?.toLowerCase() ?? item.playerName?.he?.toLowerCase() ?? "";
    return player.includes(lcQuery);
  });
}

function ownedFor(section: AlbumSection, q: Record<string, number>): number {
  return section.items.reduce(
    (acc, item) => acc + (((q[item.code] ?? 0) as number) >= 1 ? 1 : 0),
    0
  );
}

export function GroupedAlbumPage({ album }: Props) {
  const t = useTranslations();
  const lt = useLocalizedText();
  const rtl = album.theme.direction === "rtl";

  const hydrate = useCollectionStore((s) => s.hydrate);
  const isHydrated = useCollectionStore((s) => s.isHydrated);
  const setActiveAlbum = useCollectionStore((s) => s.setActiveAlbum);
  const quantities = useCollectionStore((s) => s.quantities);
  const resetAll = useCollectionStore((s) => s.resetAll);
  const markCodesComplete = useCollectionStore((s) => s.markCodesComplete);

  React.useEffect(() => {
    hydrate();
    setActiveAlbum(album.id);
  }, [album.id, hydrate, setActiveAlbum]);
  useSyncWithUser();

  const resetConfirm = useBoolean();
  const [filter, setFilter] = React.useState<FilterMode>("all");
  const [teamFilter, setTeamFilter] = React.useState<TeamFilter>("all");
  const [queryRaw, setQueryRaw] = React.useState("");
  const query = useDebounce(queryRaw, 120);
  const lcQuery = React.useMemo(() => query.trim().toLowerCase(), [query]);

  const [selectedSectionId, setSelectedSectionId] = React.useState<string | null>(null);

  const specialSections = album.sections.filter((s) => s.entityType !== "NATIONAL_TEAM");
  const teamSections = album.sections.filter((s) => s.entityType === "NATIONAL_TEAM");

  const groupedTeams = React.useMemo(() => {
    const map = new Map<string, AlbumSection[]>();
    for (const ts of teamSections) {
      const g = ts.group ?? "?";
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(ts);
    }
    return [...map.entries()];
  }, [teamSections]);

  function itemPassesFilter(qty: number): boolean {
    if (filter === "all") return true;
    if (filter === "missing") return qty === 0;
    if (filter === "owned") return qty >= 1;
    if (filter === "duplicates") return qty >= 2;
    return true;
  }

  function teamPassesActiveFilters(section: AlbumSection): boolean {
    const owned = ownedFor(section, quantities);
    const complete = owned === section.items.length;
    if (teamFilter === "completed" && !complete) return false;
    if (teamFilter === "incomplete" && complete) return false;
    if (filter === "all" && !lcQuery) return true;

    const codeOrPlayerHit = section.items.some((item) => {
      const qty = (quantities[item.code] ?? 0) as number;
      if (!itemPassesFilter(qty)) return false;
      if (!lcQuery) return true;
      if (item.code.toLowerCase().includes(lcQuery)) return true;
      const player = item.playerName?.en?.toLowerCase() ?? "";
      return player.includes(lcQuery);
    });
    if (codeOrPlayerHit) return true;
    if (lcQuery && sectionMatchesSearch(section, lcQuery)) return true;
    return false;
  }

  const visibleSpecials = specialSections.filter(
    (s) => !lcQuery || sectionMatchesSearch(s, lcQuery)
  );

  const selectedSection: AlbumSection | null =
    album.sections.find((s) => s.id === selectedSectionId) ?? null;

  const navigableSections = React.useMemo(
    () => [...album.sections].sort((a, b) => a.order - b.order),
    [album.sections]
  );

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
      <header className="mb-4 flex items-center gap-3">
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
        <AlbumShareCopyButton album={album} />
      </header>

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

      {visibleSpecials.length > 0 && (
        <section className="mt-2">
          <Typography
            variant="overline"
            as="span"
            className="text-foreground/50 mb-3 block text-[10px] font-bold tracking-[0.18em] uppercase"
          >
            {t("album.sections.specials")}
          </Typography>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {visibleSpecials.map((section) => {
              const total = section.items.length;
              const owned = ownedFor(section, quantities);
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
        </section>
      )}

      <section className="mt-6 space-y-5">
        {groupedTeams.length === 0
          ? null
          : groupedTeams.map(([group, teams]) => {
              const visibleTeams = teams.filter(teamPassesActiveFilters);
              if (visibleTeams.length === 0) return null;
              const groupComplete = teams.every(
                (s) => ownedFor(s, quantities) === s.items.length && s.items.length > 0
              );

              return (
                <section key={group} aria-labelledby={`group-${group}`}>
                  <header className="mb-2 flex flex-wrap items-center gap-2">
                    <span
                      id={`group-${group}`}
                      className="font-heading inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 via-sky-500 to-violet-600 px-2 text-sm font-black text-white shadow-sm"
                    >
                      {group}
                    </span>
                    <Typography
                      variant="overline"
                      as="span"
                      className="text-foreground/60 text-[10px] font-bold tracking-[0.18em] uppercase"
                    >
                      {t("album.team.groupLabel", { group })}
                    </Typography>
                    {groupComplete && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                        <Iconify icon="lucide:check" className="size-3" aria-hidden />
                        {t("album.team.completedBadge")}
                      </span>
                    )}
                    <span className="text-foreground/30 text-xs">
                      · {visibleTeams.length}/{teams.length}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      className="ms-auto gap-1"
                      disabled={groupComplete}
                      onClick={() => {
                        const codes = teams.flatMap((s) => s.items.map((i) => i.code));
                        markCodesComplete(codes);
                        toastSuccess(t("album.team.completeGroupSuccess"));
                      }}
                    >
                      <Iconify icon="lucide:check-check" className="size-3.5" aria-hidden />
                      <span className="hidden sm:inline">{t("album.team.completeGroup")}</span>
                      <span className="sm:hidden">{t("album.team.completeGroupShort")}</span>
                    </Button>
                  </header>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {visibleTeams.map((section) => {
                      const total = section.items.length;
                      const owned = ownedFor(section, quantities);
                      return (
                        <TeamTileSection
                          key={section.id}
                          section={section}
                          owned={owned}
                          total={total}
                          onClick={() => setSelectedSectionId(section.id)}
                        />
                      );
                    })}
                  </div>
                </section>
              );
            })}
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
        sections={navigableSections}
        onSectionChange={setSelectedSectionId}
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
