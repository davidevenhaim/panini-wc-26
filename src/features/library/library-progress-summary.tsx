"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import Iconify from "@/components/ui/iconify";
import { Progress } from "@/components/ui/progress";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import type { LibraryProgressStats } from "@/lib/album/library-progress";

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

type Props = LibraryProgressStats;

export function LibraryProgressSummary({
  totalTrackable,
  started,
  inProgress,
  completed,
  completedPercent,
}: Props) {
  const t = useTranslations();
  const notStarted = Math.max(0, totalTrackable - started);

  return (
    <div className="space-y-3">
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
            {t("library.stats.libraryProgress")}
          </Typography>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-heading text-5xl leading-none font-black">{started}</span>
            <span className="font-mono text-sm font-semibold text-white/70">
              / {totalTrackable}
            </span>
            <span className="ms-auto rounded-full bg-white/15 px-2.5 py-0.5 font-mono text-sm font-bold backdrop-blur-sm">
              {completedPercent}%
            </span>
          </div>
          <Progress
            value={completedPercent}
            className="mt-3 h-3 bg-white/20"
            aria-label={t("library.stats.libraryProgress")}
          />
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/85">
            <span className="inline-flex items-center gap-1">
              <Iconify icon="lucide:book-open" className="size-3.5" />
              {started} {t("library.stats.started")}
            </span>
            <span className="inline-flex items-center gap-1">
              <Iconify icon="lucide:loader" className="size-3.5" />
              {inProgress} {t("library.stats.inProgress")}
            </span>
            <span className="inline-flex items-center gap-1">
              <Iconify icon="lucide:check-circle" className="size-3.5" />
              {completed} {t("library.stats.completed")}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatCard
          icon="lucide:library"
          label={t("library.stats.available")}
          value={totalTrackable}
          accentColor="#0ea5e9"
        />
        <StatCard
          icon="lucide:book-marked"
          label={t("library.stats.started")}
          value={started}
          accentColor="#16a34a"
        />
        <StatCard
          icon="lucide:loader"
          label={t("library.stats.inProgress")}
          value={inProgress}
          accentColor="#f59e0b"
        />
        <StatCard
          icon="lucide:badge-check"
          label={t("library.stats.completed")}
          value={completed}
          accentColor="#8b5cf6"
        />
        {notStarted > 0 && (
          <StatCard
            icon="lucide:plus-circle"
            label={t("library.stats.notStarted")}
            value={notStarted}
            accentColor="#64748b"
            className="col-span-2 sm:col-span-4"
          />
        )}
      </div>
    </div>
  );
}
