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
import { TeamTileSection } from "./team-tile-section";
import { GenericProgressSummary } from "./generic-progress-summary";
import { ReportButton } from "@/features/data-reports/report-button";
import type { FilterMode } from "../types";

type Props = { album: Album };

type TeamFilter = "all" | "completed" | "incomplete";
type Tab = "base" | "extras";

function ownedFor(section: AlbumSection, q: Record<string, number>): number {
  return section.items.reduce((acc, it) => acc + (((q[it.code] ?? 0) as number) >= 1 ? 1 : 0), 0);
}

function sectionMatchesSearch(section: AlbumSection, lc: string): boolean {
  if (!lc) return true;
  const en = section.title.en?.toLowerCase() ?? "";
  const he = section.title.he?.toLowerCase() ?? "";
  const badge = section.badge?.toLowerCase() ?? "";
  if (en.includes(lc) || he.includes(lc) || badge.includes(lc)) return true;
  return section.items.some((it) => {
    if (it.code.toLowerCase().includes(lc)) return true;
    const player = it.playerName?.en?.toLowerCase() ?? it.playerName?.he?.toLowerCase() ?? "";
    if (player.includes(lc)) return true;
    const cat = it.category?.toLowerCase() ?? "";
    return cat.includes(lc);
  });
}

export function AdrenalynAlbumPage({ album }: Props) {
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
  const [tab, setTab] = React.useState<Tab>("base");
  const [filter, setFilter] = React.useState<FilterMode>("all");
  const [teamFilter, setTeamFilter] = React.useState<TeamFilter>("all");
  const [queryRaw, setQueryRaw] = React.useState("");
  const query = useDebounce(queryRaw, 120);
  const lcQuery = React.useMemo(() => query.trim().toLowerCase(), [query]);

  const [selectedSectionId, setSelectedSectionId] = React.useState<string | null>(null);
  const [selectedSpecialId, setSelectedSpecialId] = React.useState<string | null>(null);

  const golden = album.sections.find((s) => s.id === "golden-ballers");
  const contenders = album.sections.find((s) => s.id === "contenders");
  const teamSections = album.sections.filter((s) => s.entityType === "NATIONAL_TEAM");
  const playerCategorySections = album.sections.filter((s) => s.entityType === "PLAYER_CATEGORY");
  const specialIdsExcluded = new Set([
    "golden-ballers",
    "contenders",
    ...playerCategorySections.map((s) => s.id),
  ]);
  const specialFinishers = album.sections.filter(
    (s) => s.entityType === "SPECIAL" && !specialIdsExcluded.has(s.id)
  );

  function teamPassesFilters(section: AlbumSection): boolean {
    const owned = ownedFor(section, quantities);
    const complete = owned === section.items.length;
    if (teamFilter === "completed" && !complete) return false;
    if (teamFilter === "incomplete" && complete) return false;
    if (filter === "all" && !lcQuery) return true;
    const itemHit = section.items.some((it) => {
      const qty = (quantities[it.code] ?? 0) as number;
      const okFilter =
        filter === "all" ||
        (filter === "missing" && qty === 0) ||
        (filter === "owned" && qty >= 1) ||
        (filter === "duplicates" && qty >= 2);
      if (!okFilter) return false;
      if (!lcQuery) return true;
      if (it.code.toLowerCase().includes(lcQuery)) return true;
      const player = it.playerName?.en?.toLowerCase() ?? "";
      return player.includes(lcQuery);
    });
    if (itemHit) return true;
    if (lcQuery && sectionMatchesSearch(section, lcQuery)) return true;
    return false;
  }

  const visibleTeams = teamSections.filter(teamPassesFilters);
  const selectedSection: AlbumSection | null =
    album.sections.find((s) => s.id === selectedSectionId) ?? null;

  // Extras tab — SpecialCollection list (Momentum, Limited Editions placeholder).
  const extras = album.specialCollections ?? [];
  const selectedExtra = extras.find((s) => s.id === selectedSpecialId);

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
          <Iconify icon="lucide:layers" className="size-6" />
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
            {album.publisher} · {album.season}
          </Typography>
        </div>
      </header>

      <GenericProgressSummary album={album} quantities={quantities} />

      <div className="mt-4 flex gap-2">
        <Button
          variant={tab === "base" ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => setTab("base")}
        >
          <Iconify icon="lucide:book-open" className="size-4" />
          {t("adrenalyn.tabBase")}
        </Button>
        <Button
          variant={tab === "extras" ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => setTab("extras")}
        >
          <Iconify icon="lucide:sparkles" className="size-4" />
          {t("adrenalyn.tabExtras")} · {extras.length}
        </Button>
      </div>

      {tab === "base" && (
        <>
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

          {golden && sectionMatchesSearch(golden, lcQuery) && (
            <section className="mt-4">
              <Typography
                variant="overline"
                as="span"
                className="text-foreground/50 mb-2 block text-[10px] font-bold tracking-[0.18em] uppercase"
              >
                {t("adrenalyn.chase")}
              </Typography>
              <button
                type="button"
                onClick={() => setSelectedSectionId(golden.id)}
                className="group relative flex w-full items-center gap-4 overflow-hidden rounded-3xl border-2 border-amber-400/60 bg-gradient-to-r from-amber-300/30 via-yellow-400/30 to-amber-500/30 p-4 text-start shadow-md transition-all hover:-translate-y-0.5"
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 text-2xl font-black text-white shadow ring-2 ring-white/40">
                  ⭐
                </span>
                <div className="min-w-0 flex-1">
                  <Typography
                    variant="h6"
                    as="h2"
                    className="font-heading text-base font-extrabold sm:text-lg"
                  >
                    {golden.title.en}
                  </Typography>
                  <Typography variant="caption2" as="p" color="muted">
                    {golden.subtitle?.en ?? "Cards 1–9"}
                  </Typography>
                </div>
                <span className="bg-background/90 rounded-full px-3 py-1 font-mono text-sm font-bold tabular-nums shadow-sm">
                  {ownedFor(golden, quantities)}/{golden.items.length}
                </span>
              </button>
            </section>
          )}

          <section className="mt-6">
            <Typography
              variant="overline"
              as="span"
              className="text-foreground/50 mb-3 block text-[10px] font-bold tracking-[0.18em] uppercase"
            >
              {t("adrenalyn.nationalTeams")} · {visibleTeams.length}/{teamSections.length}
            </Typography>
            {visibleTeams.length === 0 ? (
              <div className="bg-card rounded-3xl border p-6 text-center">
                <Typography variant="body2" as="p" color="muted">
                  {t("album.search.noMatches")}
                </Typography>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
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
            )}
          </section>

          {contenders && sectionMatchesSearch(contenders, lcQuery) && (
            <section className="mt-6">
              <Typography
                variant="overline"
                as="span"
                className="text-foreground/50 mb-3 block text-[10px] font-bold tracking-[0.18em] uppercase"
              >
                {t("adrenalyn.contenders")}
              </Typography>
              <div className="grid grid-cols-1 sm:grid-cols-2">
                <GenericSectionTile
                  section={contenders}
                  owned={ownedFor(contenders, quantities)}
                  total={contenders.items.length}
                  rtl={rtl}
                  onClick={() => setSelectedSectionId(contenders.id)}
                />
              </div>
            </section>
          )}

          <section className="mt-6">
            <Typography
              variant="overline"
              as="span"
              className="text-foreground/50 mb-3 block text-[10px] font-bold tracking-[0.18em] uppercase"
            >
              {t("adrenalyn.specialCategories")}
            </Typography>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {[...playerCategorySections, ...specialFinishers].map((section) => {
                if (!sectionMatchesSearch(section, lcQuery)) return null;
                return (
                  <GenericSectionTile
                    key={section.id}
                    section={section}
                    owned={ownedFor(section, quantities)}
                    total={section.items.length}
                    rtl={rtl}
                    onClick={() => setSelectedSectionId(section.id)}
                  />
                );
              })}
            </div>
          </section>
        </>
      )}

      {tab === "extras" && (
        <section className="mt-6">
          <Typography
            variant="overline"
            as="span"
            className="text-foreground/50 mb-3 block text-[10px] font-bold tracking-[0.18em] uppercase"
          >
            {t("adrenalyn.extras")}
          </Typography>
          {extras.length === 0 ? (
            <div className="bg-card rounded-3xl border-2 border-dashed p-8 text-center">
              <Iconify icon="lucide:sparkles" className="text-foreground/30 mx-auto size-10" />
              <Typography variant="body2" as="p" color="muted" className="mt-2">
                {t("adrenalyn.extrasEmpty")}
              </Typography>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {extras.map((extra) => {
                const total = extra.items.length;
                const owned = extra.items.reduce(
                  (acc, it) => acc + (((quantities[it.code] ?? 0) as number) >= 1 ? 1 : 0),
                  0
                );
                return (
                  <li key={extra.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedSpecialId(extra.id)}
                      className="bg-card group flex w-full items-center gap-3 rounded-3xl border-2 p-4 text-start shadow-sm transition-all hover:-translate-y-0.5"
                      style={{ borderColor: `${extra.primaryColor ?? "#7c3aed"}55` }}
                    >
                      <span
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow"
                        style={{
                          background: `linear-gradient(135deg, ${extra.primaryColor ?? "#7c3aed"}, ${extra.accentColor ?? "#1e1b4b"})`,
                        }}
                        aria-hidden
                      >
                        <Iconify icon={extra.icon ?? "lucide:sparkles"} className="size-6" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <Typography
                          variant="h6"
                          as="h3"
                          className="font-heading truncate text-base font-extrabold"
                        >
                          {extra.title.en ?? extra.title.he}
                        </Typography>
                        {extra.description && (
                          <Typography
                            variant="caption2"
                            as="p"
                            color="muted"
                            className="line-clamp-2"
                          >
                            {extra.description.en ?? extra.description.he}
                          </Typography>
                        )}
                      </div>
                      <span className="bg-background/90 rounded-full px-3 py-1 font-mono text-sm font-bold tabular-nums">
                        {owned}/{total}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <Typography variant="caption2" as="p" color="muted" className="mt-4 max-w-prose text-xs">
            {t("adrenalyn.extrasNotice")}
          </Typography>
        </section>
      )}

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

      <GenericSectionDialog
        section={
          selectedExtra
            ? {
                id: selectedExtra.id,
                title: selectedExtra.title,
                order: 9999,
                entityType: "SPECIAL",
                badge: selectedExtra.icon,
                primaryColor: selectedExtra.primaryColor,
                accentColor: selectedExtra.accentColor,
                items: selectedExtra.items,
              }
            : null
        }
        albumId={album.id}
        albumTitle={lt(album.title)}
        itemType={album.itemType}
        open={selectedSpecialId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedSpecialId(null);
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
