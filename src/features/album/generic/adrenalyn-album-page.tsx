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
import type { Album, AlbumSection, SpecialCollection } from "@/collections/schema";
import { useCollectionStore } from "@/store/collection.store";
import { useSyncWithUser } from "../use-sync-with-user";
import { FilterBar } from "../filter-bar";
import { GenericSectionDialog } from "./section-dialog";
import { GenericSectionTile } from "./section-tile";
import { TeamTileSection } from "./team-tile-section";
import { GenericProgressSummary } from "./generic-progress-summary";
import { ReportButton } from "@/features/data-reports/report-button";
import { AlbumShareCopyButton } from "../album-share-copy-button";
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

function extraToSection(extra: SpecialCollection): AlbumSection {
  return {
    id: extra.id,
    title: extra.title,
    subtitle: extra.description,
    order: 9999,
    entityType: "SPECIAL",
    badge: extra.icon,
    primaryColor: extra.primaryColor,
    accentColor: extra.accentColor,
    items: extra.items,
  };
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

  const teamSections = React.useMemo(
    () =>
      album.sections
        .filter((s) => s.entityType === "NATIONAL_TEAM")
        .sort((a, b) => a.order - b.order),
    [album.sections]
  );

  const specialSections = React.useMemo(
    () =>
      album.sections
        .filter((s) => s.entityType !== "NATIONAL_TEAM")
        .sort((a, b) => a.order - b.order),
    [album.sections]
  );

  const extras: SpecialCollection[] = album.specialCollections ?? [];
  const navigableExtras = extras.map(extraToSection);

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
      const player = it.playerName?.en?.toLowerCase() ?? it.playerName?.he?.toLowerCase() ?? "";
      return player.includes(lcQuery);
    });
    if (itemHit) return true;
    if (lcQuery && sectionMatchesSearch(section, lcQuery)) return true;
    return false;
  }

  const visibleSpecials = specialSections.filter(
    (s) => !lcQuery || sectionMatchesSearch(s, lcQuery)
  );
  const visibleTeams = teamSections.filter(teamPassesFilters);

  const selectedSection: AlbumSection | null =
    album.sections.find((s) => s.id === selectedSectionId) ?? null;
  const selectedExtra = extras.find((s) => s.id === selectedSpecialId);

  const navigableSections = React.useMemo(
    () => [...specialSections, ...teamSections],
    [specialSections, teamSections]
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
        "from-background via-background bg-gradient-to-b to-emerald-50/40 dark:to-emerald-950/20"
      )}
    >
      <header className="mb-4 flex items-center gap-3">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-sky-500 to-violet-600 text-white shadow-md"
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
        <AlbumShareCopyButton album={album} />
      </header>

      <GenericProgressSummary album={album} quantities={quantities} />

      {album.binderCapacity != null && (
        <Typography variant="caption2" as="p" color="muted" className="mt-2 text-[11px]">
          {t("adrenalyn.binderCapacity", { count: album.binderCapacity })}
        </Typography>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
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
        <section className="mt-6 border-t pt-6">
          <header className="mb-4">
            <Typography
              variant="overline"
              as="span"
              className="text-foreground/50 block text-[10px] font-bold tracking-[0.18em] uppercase"
            >
              {t("album.myCollectionEyebrow")}
            </Typography>
            <Typography
              variant="h6"
              as="h2"
              className="font-heading text-xl font-black sm:text-2xl"
            >
              {t("album.myCollectionTitle")}
            </Typography>
          </header>

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
                {visibleSpecials.map((section) => (
                  <GenericSectionTile
                    key={section.id}
                    section={section}
                    owned={ownedFor(section, quantities)}
                    total={section.items.length}
                    rtl={rtl}
                    onClick={() => setSelectedSectionId(section.id)}
                  />
                ))}
              </div>
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
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {visibleTeams.map((section) => (
                  <TeamTileSection
                    key={section.id}
                    section={section}
                    owned={ownedFor(section, quantities)}
                    total={section.items.length}
                    onClick={() => setSelectedSectionId(section.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </section>
      )}

      {tab === "extras" && (
        <section className="mt-6 border-t pt-6">
          <header className="mb-4">
            <Typography
              variant="overline"
              as="span"
              className="text-foreground/50 block text-[10px] font-bold tracking-[0.18em] uppercase"
            >
              {t("adrenalyn.extras")}
            </Typography>
          </header>

          {extras.length === 0 ? (
            <div className="bg-card rounded-3xl border-2 border-dashed p-8 text-center">
              <Iconify icon="lucide:sparkles" className="text-foreground/30 mx-auto size-10" />
              <Typography variant="body2" as="p" color="muted" className="mt-2">
                {t("adrenalyn.extrasEmpty")}
              </Typography>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {extras.map((extra) => {
                const total = extra.items.length;
                const owned = extra.items.reduce(
                  (acc, it) => acc + (((quantities[it.code] ?? 0) as number) >= 1 ? 1 : 0),
                  0
                );
                if (total === 0) {
                  return (
                    <div
                      key={extra.id}
                      className="bg-card flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-4 opacity-60"
                    >
                      <Iconify
                        icon={extra.icon ?? "lucide:sparkles"}
                        className="text-foreground/40 size-8"
                      />
                      <Typography
                        variant="caption2"
                        as="p"
                        color="muted"
                        className="mt-2 text-center font-semibold"
                      >
                        {lt(extra.title)}
                      </Typography>
                    </div>
                  );
                }
                return (
                  <GenericSectionTile
                    key={extra.id}
                    section={extraToSection(extra)}
                    owned={owned}
                    total={total}
                    rtl={rtl}
                    onClick={() => setSelectedSpecialId(extra.id)}
                  />
                );
              })}
            </div>
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
        sections={navigableSections}
        onSectionChange={setSelectedSectionId}
      />

      <GenericSectionDialog
        section={selectedExtra ? extraToSection(selectedExtra) : null}
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
        sections={navigableExtras}
        onSectionChange={setSelectedSpecialId}
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
