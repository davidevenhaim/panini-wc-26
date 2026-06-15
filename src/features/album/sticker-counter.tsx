"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import Iconify from "@/components/ui/iconify";
import { cn } from "@/lib/utils";

type StickerCounterProps = {
  code: string;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onToggle: () => void;
  /** Optional color tint for owned state (defaults to team primary green). */
  ownedColor?: string;
  className?: string;
  /** Compact mode shrinks padding for dense grids. */
  compact?: boolean;
};

const OWN_GREEN = "#16a34a";

export const StickerCounter = React.memo(function StickerCounter({
  code,
  quantity,
  onIncrement,
  onDecrement,
  onToggle,
  ownedColor,
  className,
  compact = true,
}: StickerCounterProps) {
  const t = useTranslations();
  const isOwned = quantity >= 1;
  const isDuplicate = quantity >= 2;
  const duplicates = Math.max(0, quantity - 1);

  const baseColor = ownedColor ?? OWN_GREEN;

  return (
    <div
      className={cn(
        "group relative flex items-center justify-between gap-1 rounded-2xl border-2 transition-all duration-200",
        "select-none",
        compact ? "p-1.5" : "p-2",
        isOwned
          ? "border-emerald-500/70 bg-emerald-500/10 shadow-sm ring-1 ring-emerald-500/30 dark:bg-emerald-400/10"
          : "border-border/70 bg-muted/30 border-dashed",
        isDuplicate && "shadow-emerald-500/20",
        className
      )}
      style={
        isOwned
          ? ({
              borderColor: baseColor,
              boxShadow: `0 0 0 1px ${baseColor}25, 0 2px 6px ${baseColor}20`,
            } as React.CSSProperties)
          : undefined
      }
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDecrement();
        }}
        aria-label={t("album.sticker.decrement", { code })}
        disabled={quantity === 0}
        className={cn(
          "text-foreground/80 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all",
          "hover:bg-foreground/10 active:scale-90 disabled:opacity-30",
          "touch-manipulation"
        )}
      >
        <Iconify icon="lucide:minus" className="size-4" />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        aria-label={t("album.sticker.toggle", { code })}
        className={cn(
          "font-heading flex min-w-0 flex-1 flex-col items-center justify-center rounded-xl px-1 py-1 text-sm font-bold tracking-tight transition-all",
          "hover:bg-foreground/5 active:scale-95",
          isOwned ? "text-emerald-900 dark:text-emerald-100" : "text-foreground/50"
        )}
      >
        <span className="truncate text-[0.95em] leading-tight">{code}</span>
        {isOwned && (
          <Iconify
            icon={isDuplicate ? "lucide:copy-check" : "lucide:check"}
            className="size-3.5 opacity-80"
            aria-hidden
          />
        )}
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onIncrement();
        }}
        aria-label={t("album.sticker.increment", { code })}
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all",
          "touch-manipulation active:scale-90",
          isOwned
            ? "bg-emerald-500 text-white shadow-sm hover:bg-emerald-600"
            : "bg-foreground/10 text-foreground hover:bg-foreground/15"
        )}
      >
        <Iconify icon="lucide:plus" className="size-4" />
      </button>

      {isDuplicate && (
        <span
          aria-label={t("album.sticker.duplicateBadge", { count: duplicates })}
          className="ring-background pointer-events-none absolute -end-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white shadow-md ring-2"
        >
          +{duplicates}
        </span>
      )}
    </div>
  );
});
