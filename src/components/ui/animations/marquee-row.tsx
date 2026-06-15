"use client";

// Marquee implementation inspired by ui-layouts.com/components/marquee
// Key technique: each strip animates by calc(-100% - var(--mq-gap)) so the
// scroll distance equals exactly one strip width + gap → seam is always clean.

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type MarqueeRowProps = {
  children: ReactNode;
  /** Seconds for one full cycle. Default: 20 */
  speed?: number;
  direction?: "left" | "right";
  /** Pause animation on hover. Default: true */
  pauseOnHover?: boolean;
  /** Gap between items in rem. Default: 2 */
  gap?: number;
  /**
   * How many copies of children to render.
   * Increase for very few / very narrow items so the row always stays full.
   * Default: 4
   */
  repeat?: number;
  className?: string;
};

export function MarqueeRow({
  children,
  speed = 20,
  direction = "left",
  pauseOnHover = true,
  gap = 2,
  repeat = 4,
  className,
}: MarqueeRowProps) {
  return (
    <div
      className={cn("group flex overflow-hidden", className)}
      style={{ "--mq-gap": `${gap}rem`, "--mq-speed": `${speed}s` } as React.CSSProperties}
    >
      <style>{`
        @keyframes mq-left {
          from { transform: translateX(0); }
          to   { transform: translateX(calc(-100% - var(--mq-gap))); }
        }
        @keyframes mq-right {
          from { transform: translateX(calc(-100% - var(--mq-gap))); }
          to   { transform: translateX(0); }
        }
        @media (prefers-reduced-motion: reduce) { .mq-strip { animation-play-state: paused; } }
      `}</style>

      {Array.from({ length: repeat }, (_, i) => (
        <div
          key={i}
          className={cn(
            "mq-strip flex shrink-0 items-center",
            pauseOnHover && "group-hover:[animation-play-state:paused]"
          )}
          style={{
            gap: "var(--mq-gap)",
            animation: `mq-${direction} var(--mq-speed) linear infinite`,
          }}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
