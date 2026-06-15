// Inspired by ui-layouts.com/components/infinity-brand (MIT licence — naymur rahman)
// Design extended: gradient mask edges, larger tiles, hover shimmer, glass surface.

import { cn } from "@/lib/utils";
import { MarqueeRow } from "@/components/ui/animations/marquee-row";
import Iconify from "@/components/ui/iconify";
import { Typography } from "@/components/ui/typography";
import type { ReactNode } from "react";

// ── Brand tile ────────────────────────────────────────────────────────────────

export type BrandItem = {
  id: string;
  icon: string;
  label: string;
};

function BrandTile({ icon, label }: { icon: string; label: string }) {
  return (
    <div
      className={cn(
        "group/tile relative flex shrink-0 items-center gap-3",
        "border-border/50 bg-background/60 rounded-2xl border px-5 py-3",
        "shadow-sm backdrop-blur-md",
        "transition-[border-color,box-shadow] duration-300",
        "hover:border-primary/30 hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.15),0_4px_16px_-4px_hsl(var(--primary)/0.12)]"
      )}
    >
      {/* Icon container */}
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-xl",
          "border-border/40 bg-muted/60 border",
          "group-hover/tile:border-primary/20 group-hover/tile:bg-primary/5 transition-colors duration-300"
        )}
      >
        <Iconify icon={icon} className="size-5" aria-hidden />
      </span>

      {/* Label */}
      <Typography
        variant="label2"
        className="text-foreground/75 group-hover/tile:text-foreground/95 tracking-tight whitespace-nowrap transition-colors duration-300"
      >
        {label}
      </Typography>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────

type InfinityBrandMarqueeProps = {
  brands: readonly BrandItem[];
  label?: ReactNode;
  speed?: number;
  gap?: number;
  repeat?: number;
  className?: string;
};

export function InfinityBrandMarquee({
  brands,
  label,
  speed = 30,
  gap = 1,
  repeat = 4,
  className,
}: InfinityBrandMarqueeProps) {
  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="mb-8 text-center">
          {typeof label === "string" ? (
            <Typography
              variant="overline"
              className="text-muted-foreground tracking-[0.22em] uppercase"
            >
              {label}
            </Typography>
          ) : (
            label
          )}
        </div>
      )}

      {/* Gradient-mask wrapper — fades both edges without a background overlay */}
      {/* dir="ltr" forces physical LTR strip layout so animation works in RTL pages */}
      <div
        dir="ltr"
        className="overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
        }}
      >
        <MarqueeRow speed={speed} gap={gap} repeat={repeat} pauseOnHover>
          {brands.map((brand) => (
            <BrandTile key={brand.id} icon={brand.icon} label={brand.label} />
          ))}
        </MarqueeRow>
      </div>
    </div>
  );
}
