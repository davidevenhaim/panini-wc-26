"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import Iconify from "@/components/ui/iconify";
import { cn } from "@/lib/utils";
import type { Team } from "@/types/album.types";

type Props = {
  team: Team;
  owned: number;
  total: number;
  onClick: () => void;
  className?: string;
};

export const TeamTile = React.memo(function TeamTile({
  team,
  owned,
  total,
  onClick,
  className,
}: Props) {
  const t = useTranslations();
  const isComplete = owned === total;
  const percent = total === 0 ? 0 : Math.round((owned / total) * 100);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${team.name} (${team.code}) — ${owned}/${total}`}
      className={cn(
        "group relative flex flex-col items-center justify-between gap-2 overflow-hidden rounded-3xl border-2 p-3 transition-all duration-200",
        "shadow-sm hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]",
        "touch-manipulation",
        isComplete && "ring-2 ring-emerald-500/60",
        className
      )}
      style={{
        background: `linear-gradient(155deg, ${team.primaryColor}28 0%, ${team.accentColor}18 60%, transparent 100%)`,
        borderColor: isComplete ? "#10b981" : `${team.primaryColor}55`,
      }}
    >
      {/* Decorative ribbon at top */}
      <span
        className="absolute inset-x-0 top-0 h-1"
        style={{
          background: `linear-gradient(90deg, ${team.primaryColor} 0%, ${team.accentColor} 100%)`,
        }}
        aria-hidden
      />

      {/* Progress badge top-end */}
      <span
        className={cn(
          "absolute end-2 top-2 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold tabular-nums shadow-sm",
          isComplete
            ? "bg-emerald-500 text-white"
            : owned === 0
              ? "bg-foreground/10 text-foreground/70"
              : "bg-background/90 text-foreground"
        )}
      >
        {owned}/{total}
      </span>

      {isComplete && (
        <span
          className="absolute start-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm"
          aria-label={t("album.team.completedBadge")}
        >
          <Iconify icon="lucide:check" className="size-3" />
        </span>
      )}

      <div className="mt-3 flex flex-col items-center gap-1.5">
        <span
          className="ring-border/30 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-4xl shadow-sm ring-2 sm:h-16 sm:w-16 dark:bg-gray-700"
          aria-hidden
        >
          <span className="drop-shadow-sm">{team.flag}</span>
        </span>
        <span
          className="font-heading text-lg font-black tracking-wider sm:text-xl"
          style={{ color: team.primaryColor }}
        >
          {team.code}
        </span>
      </div>

      {/* Progress bar */}
      <div className="bg-foreground/10 mt-1 h-1.5 w-full overflow-hidden rounded-full">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percent}%`,
            background: isComplete
              ? "#10b981"
              : `linear-gradient(90deg, ${team.primaryColor} 0%, ${team.accentColor} 100%)`,
          }}
        />
      </div>
    </button>
  );
});
