"use client";

import * as React from "react";
import Iconify from "@/components/ui/iconify";
import { cn } from "@/lib/utils";
import { readableOnDarkSurface } from "@/utils/color.utils";

type Props = {
  title: string;
  shortCode: string;
  /** Iconify name — used when no `imageSrc` is supplied. */
  icon: string;
  /** Optional image to render instead of the Iconify icon. */
  imageSrc?: string;
  accentColor: string;
  owned: number;
  total: number;
  onClick: () => void;
  className?: string;
};

export const SpecialTile = React.memo(function SpecialTile({
  title,
  shortCode,
  icon,
  imageSrc,
  accentColor,
  owned,
  total,
  onClick,
  className,
}: Props) {
  const isComplete = owned === total && total > 0;
  const percent = total === 0 ? 0 : Math.round((owned / total) * 100);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${title} — ${owned}/${total}`}
      className={cn(
        "group relative flex flex-col items-center justify-between gap-2 overflow-hidden rounded-3xl border-2 p-3 transition-all duration-200",
        "shadow-sm hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]",
        "touch-manipulation",
        isComplete && "ring-2 ring-emerald-500/60",
        className
      )}
      style={{
        background: `linear-gradient(155deg, ${accentColor}30 0%, ${accentColor}10 60%, transparent 100%), var(--card)`,
        borderColor: isComplete ? "#10b981" : `${accentColor}55`,
      }}
    >
      <span
        className="absolute inset-x-0 top-0 h-1"
        style={{
          background: `linear-gradient(90deg, ${accentColor} 0%, ${accentColor}99 100%)`,
        }}
        aria-hidden
      />

      <span
        className={cn(
          "absolute end-2 top-2 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold tabular-nums shadow-sm",
          isComplete
            ? "bg-emerald-500 text-white"
            : owned === 0
              ? "bg-muted/90 text-foreground"
              : "bg-background/90 text-foreground"
        )}
      >
        {owned}/{total}
      </span>

      {isComplete && (
        <span
          className="absolute start-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm"
          aria-hidden
        >
          <Iconify icon="lucide:check" className="size-3" />
        </span>
      )}

      <div className="mt-3 flex flex-col items-center gap-1.5">
        <span
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm ring-2 ring-white/40 sm:h-16 sm:w-16",
            imageSrc ? "overflow-hidden bg-white" : "text-white"
          )}
          style={imageSrc ? undefined : { backgroundColor: accentColor }}
          aria-hidden
        >
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt=""
              className="h-full w-full object-contain p-1.5"
              draggable={false}
            />
          ) : (
            <Iconify icon={icon} className="size-7" />
          )}
        </span>
        <span
          className="font-heading text-lg font-black tracking-wider [color:var(--team-fg-light)] sm:text-xl dark:[color:var(--team-fg-dark)]"
          style={
            {
              "--team-fg-light": accentColor,
              "--team-fg-dark": readableOnDarkSurface(accentColor),
            } as React.CSSProperties
          }
        >
          {shortCode}
        </span>
      </div>

      <div className="bg-muted mt-1 h-1.5 w-full overflow-hidden rounded-full">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percent}%`,
            background: isComplete ? "#10b981" : accentColor,
          }}
        />
      </div>
    </button>
  );
});
