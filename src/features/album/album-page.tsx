"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { AreYouSureDialog } from "@/components/ui/are-you-sure-dialog";
import { AlbumFooter } from "./album-footer";
import { Typography } from "@/components/ui/typography";
import { useBoolean } from "@/hooks/use-boolean";
import { useDebounce } from "@/hooks/use-debounce";
import { toastSuccess } from "@/lib/toast";
import { cn } from "@/lib/utils";
import {
  computeAlbumStats,
  computeBonusStats,
  computeFwcStats,
  countCompletedTeams,
  getQuantity,
} from "@/lib/album/collection";
import {
  BONUS_SECTION,
  FWC_CLOSING_SECTION,
  FWC_OPENING_SECTION,
  PANINI_LOGO_SECTION,
  TEAMS,
  TEAM_INDEX,
} from "@/constants/album";
import type { SpecialSection } from "@/types/album.types";
import { useCollectionStore } from "@/store/collection.store";
import { AlbumHeader } from "./album-header";
import { FilterBar } from "./filter-bar";
import { ImportExportDialog } from "./import-export-dialog";
import { ProgressSummary } from "./progress-summary";
import { SpecialDialog } from "./special-dialog";
import { SpecialTile } from "./special-tile";
import { TeamDialog } from "./team-dialog";
import { TeamGrid } from "./team-grid";
import type { FilterMode } from "./types";
import { useSyncWithUser } from "./use-sync-with-user";

type TeamFilter = "all" | "completed" | "incomplete";

type SpecialEntry = {
  section: SpecialSection;
  title: string;
  shortCode: string;
  icon: string;
  imageSrc?: string;
  accentColor: string;
};

function sectionMatchesQuery(section: SpecialSection, lcQuery: string): boolean {
  if (!lcQuery) return true;
  return section.stickers.some((s) => s.code.toLowerCase().includes(lcQuery));
}

type AlbumPageProps = {
  collectors?: React.ReactNode;
};

export function AlbumPage({ collectors }: AlbumPageProps) {
  const t = useTranslations();

  const hydrate = useCollectionStore((s) => s.hydrate);
  const isHydrated = useCollectionStore((s) => s.isHydrated);
  const quantities = useCollectionStore((s) => s.quantities);
  const resetAll = useCollectionStore((s) => s.resetAll);

  React.useEffect(() => {
    hydrate();
  }, [hydrate]);

  useSyncWithUser();

  const importExport = useBoolean();
  const resetConfirm = useBoolean();

  const [filter, setFilter] = React.useState<FilterMode>("all");
  const [teamFilter, setTeamFilter] = React.useState<TeamFilter>("all");
  const [queryRaw, setQueryRaw] = React.useState("");
  const query = useDebounce(queryRaw, 120);

  const [selectedTeamCode, setSelectedTeamCode] = React.useState<string | null>(null);
  const [selectedSpecialId, setSelectedSpecialId] = React.useState<string | null>(null);

  const fwcStickers = React.useMemo(
    () => [...FWC_OPENING_SECTION.stickers, ...FWC_CLOSING_SECTION.stickers],
    []
  );

  const albumStats = computeAlbumStats(quantities);
  const bonusStats = computeBonusStats(quantities);
  const fwcStats = computeFwcStats(fwcStickers, quantities);
  const completedTeams = countCompletedTeams(quantities);

  const lcQuery = React.useMemo(() => query.trim().toLowerCase(), [query]);

  const specials: SpecialEntry[] = React.useMemo(
    () => [
      {
        section: PANINI_LOGO_SECTION,
        title: t("album.sections.paniniLogo"),
        shortCode: "Panini",
        icon: "lucide:sticker",
        imageSrc: "/panini.png",
        accentColor: "#facc15",
      },
      {
        section: FWC_OPENING_SECTION,
        title: t("album.sections.openingFwc"),
        shortCode: "FWC 1-8",
        icon: "lucide:trophy",
        imageSrc: "/fwc.jpg",
        accentColor: "#0ea5e9",
      },
      {
        section: FWC_CLOSING_SECTION,
        title: t("album.sections.closingFwc"),
        shortCode: "FWC 9-19",
        icon: "lucide:flag",
        imageSrc: "/fwc.jpg",
        accentColor: "#0ea5e9",
      },
      {
        section: BONUS_SECTION,
        title: t("album.sections.bonus"),
        shortCode: "Coca-Cola",
        icon: "lucide:gift",
        imageSrc: "/coca.png",
        accentColor: "#dc2626",
      },
    ],
    [t]
  );

  const visibleSpecials = specials.filter((s) => sectionMatchesQuery(s.section, lcQuery));
  const selectedSpecial = selectedSpecialId
    ? (specials.find((s) => s.section.id === selectedSpecialId) ?? null)
    : null;

  const visibleTeamCodes = React.useMemo(() => {
    const set = new Set<string>();
    for (const team of TEAMS) {
      const owned = team.stickers.filter((s) => getQuantity(quantities, s.code) >= 1).length;
      const isComplete = owned === team.stickers.length;
      if (teamFilter === "completed" && !isComplete) continue;
      if (teamFilter === "incomplete" && isComplete) continue;

      if (filter !== "all" || lcQuery) {
        const teamNameMatches =
          !!lcQuery &&
          (team.code.toLowerCase().includes(lcQuery) || team.name.toLowerCase().includes(lcQuery));
        if (!(teamNameMatches && filter === "all")) {
          const anyStickerMatch = team.stickers.some((s) => {
            const qty = getQuantity(quantities, s.code);
            const filterOk =
              filter === "all" ||
              (filter === "missing" && qty === 0) ||
              (filter === "owned" && qty >= 1) ||
              (filter === "duplicates" && qty >= 2);
            if (!filterOk) return false;
            if (!lcQuery) return true;
            return s.code.toLowerCase().includes(lcQuery);
          });
          if (!anyStickerMatch && !teamNameMatches) continue;
        }
      }
      set.add(team.code);
    }
    return set;
  }, [filter, teamFilter, lcQuery, quantities]);

  const selectedTeam = selectedTeamCode ? TEAM_INDEX[selectedTeamCode] : null;

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
      className={cn(
        "mx-auto min-h-svh w-full px-4 pt-4 pb-16 sm:px-6 sm:pt-6 lg:px-10",
        "from-background via-background bg-gradient-to-b to-emerald-50/40 dark:to-emerald-950/20"
      )}
    >
      <AlbumHeader onOpenImportExport={importExport.onTrue} onOpenReset={resetConfirm.onTrue} />

      <ProgressSummary
        albumOwned={albumStats.unique}
        albumTotal={albumStats.total}
        albumPercent={albumStats.percent}
        duplicatesCount={albumStats.duplicates}
        missingCount={albumStats.missing}
        completedTeams={completedTeams}
        totalTeams={TEAMS.length}
        fwcOwned={fwcStats.unique}
        fwcTotal={fwcStats.total}
        bonusOwned={bonusStats.unique}
        bonusTotal={bonusStats.total}
      />

      {collectors}

      <section className="mt-6 border-t pt-6">
        <header className="mb-4">
          <Typography
            variant="overline"
            as="span"
            className="text-foreground/50 block text-[10px] font-bold tracking-[0.18em] uppercase"
          >
            {t("album.myCollectionEyebrow")}
          </Typography>
          <Typography variant="h6" as="h2" className="font-heading text-xl font-black sm:text-2xl">
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

        {/* Special sections row (Panini logo + FWC + Bonus) */}
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
              {visibleSpecials.map((entry) => {
                const owned = entry.section.stickers.reduce(
                  (acc, s) => acc + (getQuantity(quantities, s.code) >= 1 ? 1 : 0),
                  0
                );
                return (
                  <SpecialTile
                    key={entry.section.id}
                    title={entry.title}
                    shortCode={entry.shortCode}
                    icon={entry.icon}
                    imageSrc={entry.imageSrc}
                    accentColor={entry.accentColor}
                    owned={owned}
                    total={entry.section.stickers.length}
                    onClick={() => setSelectedSpecialId(entry.section.id)}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* Teams */}
        <section className="mt-6">
          <Typography
            variant="overline"
            as="span"
            className="text-foreground/50 mb-3 block text-[10px] font-bold tracking-[0.18em] uppercase"
          >
            {t("album.sections.teams")} · {visibleTeamCodes.size}/{TEAMS.length}
          </Typography>
          {visibleTeamCodes.size === 0 ? (
            <div className="bg-card rounded-3xl border p-6 text-center">
              <Typography variant="body2" as="p" color="muted">
                {t("album.search.noMatches")}
              </Typography>
            </div>
          ) : (
            <TeamGrid
              visibleTeamCodes={visibleTeamCodes}
              onSelectTeam={(code) => setSelectedTeamCode(code)}
              filter={filter}
            />
          )}
        </section>
      </section>

      <AlbumFooter />

      <TeamDialog
        team={selectedTeam}
        open={selectedTeamCode !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedTeamCode(null);
        }}
        filter={filter}
        query={query}
      />

      <SpecialDialog
        section={selectedSpecial?.section ?? null}
        accentColor={selectedSpecial?.accentColor ?? "#0f172a"}
        icon={selectedSpecial?.icon ?? "lucide:sticker"}
        imageSrc={selectedSpecial?.imageSrc}
        open={selectedSpecialId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedSpecialId(null);
        }}
        filter={filter}
        query={query}
      />

      <ImportExportDialog open={importExport.value} onOpenChange={importExport.onToggle} />
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
