"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Typography } from "@/components/ui/typography";
import { TEAM_GROUP_ORDER, TEAMS_BY_GROUP } from "@/constants/album";
import { getQuantity } from "@/lib/album/collection";
import { useCollectionStore } from "@/store/collection.store";
import { TeamTile } from "./team-tile";
import type { FilterMode } from "./types";

type Props = {
  /** Teams that match active filter/search; tiles not in this set are hidden. */
  visibleTeamCodes: Set<string>;
  onSelectTeam: (code: string) => void;
  /** Filter mode kept for future variants (currently used by parent). */
  filter: FilterMode;
};

export function TeamGrid({ visibleTeamCodes, onSelectTeam }: Props) {
  const t = useTranslations();
  const quantities = useCollectionStore((s) => s.quantities);

  return (
    <div className="space-y-5">
      {TEAM_GROUP_ORDER.map((group) => {
        const teams = TEAMS_BY_GROUP[group] ?? [];
        const visibleTeams = teams.filter((team) => visibleTeamCodes.has(team.code));
        if (visibleTeams.length === 0) return null;

        return (
          <section key={group} aria-labelledby={`group-${group}`}>
            <header className="mb-2 flex items-center gap-2">
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
              <span className="text-foreground/30 text-xs">
                · {visibleTeams.length}/{teams.length}
              </span>
            </header>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {visibleTeams.map((team) => {
                const owned = team.stickers.reduce(
                  (acc, s) => acc + (getQuantity(quantities, s.code) >= 1 ? 1 : 0),
                  0
                );
                return (
                  <TeamTile
                    key={team.code}
                    team={team}
                    owned={owned}
                    total={team.stickers.length}
                    onClick={() => onSelectTeam(team.code)}
                  />
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
