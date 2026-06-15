import type { ReactNode } from "react";
import Iconify from "@/components/ui/iconify";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export type MarqueeBrandTileProps = {
  /** Iconify icon id (e.g. `logos:react`) */
  icon: string;
  /** Brand or product label beside the logo */
  label: ReactNode;
  className?: string;
  iconClassName?: string;
};

/**
 * Pill-style tile for infinite marquees: logo + label with a light “card”
 * treatment so each brand reads clearly while the row stays in motion.
 */
export function MarqueeBrandTile({ icon, label, className, iconClassName }: MarqueeBrandTileProps) {
  return (
    <div
      className={cn(
        "border-border/70 bg-card/85 flex shrink-0 items-center gap-3 rounded-2xl border px-4 py-2.5 shadow-xs backdrop-blur-md",
        "ring-border/40 hover:border-primary/35 hover:ring-primary/15 transition-[box-shadow,border-color,ring-color] duration-200 hover:shadow-sm",
        className
      )}
    >
      <span className="bg-background/80 border-border/50 flex size-10 shrink-0 items-center justify-center rounded-xl border shadow-inner">
        <Iconify icon={icon} className={cn("size-6", iconClassName)} aria-hidden />
      </span>
      <Typography variant="label2" className="text-foreground tracking-tight">
        {label}
      </Typography>
    </div>
  );
}
