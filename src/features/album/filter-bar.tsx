"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/iconify";
import { cn } from "@/lib/utils";
import type { FilterMode } from "./types";

type Props = {
  filter: FilterMode;
  onFilterChange: (mode: FilterMode) => void;
  teamFilter: "all" | "completed" | "incomplete";
  onTeamFilterChange: (mode: "all" | "completed" | "incomplete") => void;
  query: string;
  onQueryChange: (q: string) => void;
};

const FILTER_OPTIONS: { mode: FilterMode; icon: string; key: string }[] = [
  { mode: "all", icon: "lucide:layout-grid", key: "all" },
  { mode: "missing", icon: "lucide:square-dashed", key: "missing" },
  { mode: "owned", icon: "lucide:check", key: "owned" },
  { mode: "duplicates", icon: "lucide:copy", key: "duplicates" },
];

const TEAM_OPTIONS = [
  { mode: "all" as const, icon: "lucide:users", key: "all" },
  { mode: "completed" as const, icon: "lucide:check-check", key: "completedTeams" },
  { mode: "incomplete" as const, icon: "lucide:loader", key: "incompleteTeams" },
];

export function FilterBar({
  filter,
  onFilterChange,
  teamFilter,
  onTeamFilterChange,
  query,
  onQueryChange,
}: Props) {
  const t = useTranslations();

  return (
    <div className="bg-background/85 sticky top-0 z-30 -mx-3 mb-3 border-b px-3 pt-3 pb-3 backdrop-blur-lg sm:-mx-4 sm:px-4">
      <div className="relative">
        <Iconify
          icon="lucide:search"
          className="text-foreground/40 pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={t("album.search.placeholder")}
          className={cn(
            "bg-card h-11 w-full rounded-2xl border ps-10 pe-3 font-sans text-sm outline-none",
            "focus-visible:ring-ring/40 focus-visible:ring-2"
          )}
          aria-label={t("search")}
        />
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTER_OPTIONS.map((option) => {
          const active = filter === option.mode;
          return (
            <Button
              key={option.mode}
              variant={active ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange(option.mode)}
              className={cn("shrink-0 rounded-full")}
            >
              <Iconify icon={option.icon} className="size-3.5" />
              {t(`album.filters.${option.key}`)}
            </Button>
          );
        })}
        <span className="bg-border w-px self-stretch" />
        {TEAM_OPTIONS.map((option) => {
          const active = teamFilter === option.mode;
          return (
            <Button
              key={option.mode}
              variant={active ? "secondary" : "outline"}
              size="sm"
              onClick={() => onTeamFilterChange(option.mode)}
              className={cn("shrink-0 rounded-full")}
            >
              <Iconify icon={option.icon} className="size-3.5" />
              {t(`album.filters.${option.key}`)}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
