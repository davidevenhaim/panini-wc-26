"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import Iconify from "@/components/ui/iconify";
import { Progress } from "@/components/ui/progress";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

type StatCardProps = {
  icon: string;
  label: string;
  value: React.ReactNode;
  accentColor?: string;
  className?: string;
};

function StatCard({ icon, label, value, accentColor, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-card/80 flex items-center gap-2 rounded-2xl border p-3 shadow-sm backdrop-blur-sm",
        className
      )}
      style={accentColor ? { borderColor: `${accentColor}55` } : undefined}
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
        style={{ backgroundColor: accentColor ?? "#0f172a" }}
        aria-hidden
      >
        <Iconify icon={icon} className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <Typography
          variant="overline"
          as="span"
          className="text-foreground/60 block truncate text-[10px] font-bold tracking-wider uppercase"
        >
          {label}
        </Typography>
        <Typography
          variant="subtitle1"
          as="span"
          className="font-heading block text-xl leading-none font-extrabold"
        >
          {value}
        </Typography>
      </div>
    </div>
  );
}

type Props = {
  albumOwned: number;
  albumTotal: number;
  albumPercent: number;
  duplicatesCount: number;
  missingCount: number;
  completedTeams: number;
  totalTeams: number;
  fwcOwned: number;
  fwcTotal: number;
  bonusOwned: number;
  bonusTotal: number;
};

export function ProgressSummary(props: Props) {
  const t = useTranslations();

  return (
    <div className="space-y-3">
      {/* Headline progress */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-sky-500 to-violet-600 p-5 text-white shadow-lg">
        <div className="absolute inset-0 -z-0 opacity-30">
          <div className="absolute -end-12 -top-12 h-44 w-44 rounded-full bg-white/30 blur-2xl" />
          <div className="absolute -start-12 -bottom-16 h-48 w-48 rounded-full bg-yellow-300/40 blur-3xl" />
        </div>
        <div className="relative">
          <Typography
            variant="overline"
            as="p"
            className="text-[11px] font-bold tracking-[0.18em] text-white/80 uppercase"
          >
            {t("album.stats.albumProgress")}
          </Typography>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-heading text-5xl leading-none font-black">
              {props.albumOwned}
            </span>
            <span className="font-mono text-sm font-semibold text-white/70">
              / {props.albumTotal}
            </span>
            <span className="ms-auto rounded-full bg-white/15 px-2.5 py-0.5 font-mono text-sm font-bold backdrop-blur-sm">
              {props.albumPercent}%
            </span>
          </div>
          <Progress
            value={props.albumPercent}
            className="mt-3 h-3 bg-white/20"
            aria-label={t("album.stats.albumProgress")}
          />
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/85">
            <span className="inline-flex items-center gap-1">
              <Iconify icon="lucide:check-circle" className="size-3.5" />
              {props.albumOwned} {t("album.stats.unique")}
            </span>
            <span className="inline-flex items-center gap-1">
              <Iconify icon="lucide:square-dashed" className="size-3.5" />
              {props.missingCount} {t("album.stats.missing")}
            </span>
            <span className="inline-flex items-center gap-1">
              <Iconify icon="lucide:copy" className="size-3.5" />
              {props.duplicatesCount} {t("album.stats.duplicates")}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatCard
          icon="lucide:check-check"
          label={t("album.stats.completedTeams")}
          value={
            <span className="flex items-baseline gap-1">
              {props.completedTeams}
              <span className="text-foreground/60 font-mono text-sm">/ {props.totalTeams}</span>
            </span>
          }
          accentColor="#16a34a"
        />
        <StatCard
          icon="lucide:trophy"
          label={t("album.stats.fwcProgress")}
          value={
            <span className="flex items-baseline gap-1">
              {props.fwcOwned}
              <span className="text-foreground/60 font-mono text-sm">/ {props.fwcTotal}</span>
            </span>
          }
          accentColor="#f59e0b"
        />
        <StatCard
          icon="lucide:copy"
          label={t("album.stats.duplicates")}
          value={props.duplicatesCount}
          accentColor="#ea580c"
        />
        <StatCard
          icon="lucide:gift"
          label={t("album.stats.bonusProgress")}
          value={
            <span className="flex items-baseline gap-1">
              {props.bonusOwned}
              <span className="text-foreground/60 font-mono text-sm">/ {props.bonusTotal}</span>
            </span>
          }
          accentColor="#dc2626"
        />
      </div>
    </div>
  );
}
