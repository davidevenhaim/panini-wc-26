"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export type StickyScrollItem = {
  visual: ReactNode;
  /** Short label above the title (e.g. “Ship mode”) */
  eyebrow?: string;
  title: string;
  description: string;
};

type StickyScrollSplitProps = {
  items: StickyScrollItem[];
  className?: string;
};

const STEP_PAD = "flex min-h-svh flex-col justify-center px-6 py-16 md:px-10 md:py-0 lg:px-14";

export function StickyScrollSplit({ items, className }: StickyScrollSplitProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    sectionRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveIndex(i);
        },
        { threshold: 0.45 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [items.length]);

  return (
    <div className={cn("flex flex-col md:flex-row", className)}>
      {/* Sticky visual — desktop */}
      <div
        className={cn(
          "sticky top-0 hidden h-svh w-1/2 flex-col md:flex",
          "bg-muted/15 border-border/60 border-b md:border-r md:border-b-0"
        )}
      >
        <div className="flex flex-1 flex-col items-center justify-center gap-8 p-8 lg:p-12">
          <div className="relative w-full max-w-md">
            <div
              className={cn(
                "border-border/60 from-card/95 via-card/75 to-muted/50",
                "relative overflow-hidden rounded-[2rem] border bg-gradient-to-br p-3 shadow-2xl ring-1 ring-black/5 dark:ring-white/10"
              )}
            >
              <div
                className="border-border/40 bg-background/40 absolute inset-x-6 top-3 h-8 rounded-t-lg border border-b-0 opacity-50"
                aria-hidden
              />
              <div className="border-border/30 from-background/80 to-muted/30 relative aspect-square w-full overflow-hidden rounded-3xl border bg-gradient-to-b shadow-inner">
                {items.map((item, i) => (
                  <div
                    key={i}
                    className={cn(
                      "absolute inset-0 flex items-center justify-center p-6 transition-all duration-500 ease-out",
                      i === activeIndex
                        ? "z-10 scale-100 opacity-100"
                        : "pointer-events-none z-0 scale-[0.94] opacity-0"
                    )}
                    aria-hidden={i !== activeIndex}
                  >
                    {item.visual}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2" role="tablist" aria-label="Feature steps">
            {items.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  i === activeIndex ? "bg-primary w-10" : "bg-muted-foreground/20 w-2"
                )}
                aria-current={i === activeIndex ? "step" : undefined}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Scroll narrative */}
      <div className="w-full md:w-1/2">
        {items.map((item, i) => (
          <div
            key={i}
            ref={(el) => {
              sectionRefs.current[i] = el;
            }}
            className={STEP_PAD}
          >
            <div className="mb-8 md:hidden">
              <div
                className={cn(
                  "border-border/60 from-card/90 to-muted/40",
                  "relative overflow-hidden rounded-3xl border bg-gradient-to-br p-3 shadow-lg ring-1 ring-black/5 dark:ring-white/5"
                )}
              >
                <div className="border-border/40 from-background/90 to-muted/25 relative aspect-[4/3] w-full overflow-hidden rounded-2xl border bg-gradient-to-b">
                  {item.visual}
                </div>
              </div>
            </div>

            <article
              className={cn(
                "border-border/55 from-card/80 via-card/40 to-muted/25 relative overflow-hidden rounded-3xl border bg-gradient-to-br p-8 shadow-sm md:p-10",
                "ring-black/5 transition-[box-shadow,ring-color] duration-500 dark:ring-white/5",
                i === activeIndex ? "ring-primary/25 shadow-lg ring-2 md:shadow-xl" : "ring-1"
              )}
            >
              <div
                className="text-muted-foreground/25 pointer-events-none absolute -top-2 -right-1 font-mono text-7xl leading-none font-bold tabular-nums select-none"
                aria-hidden
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              {item.eyebrow ? (
                <Typography
                  variant="overline"
                  className="text-primary mb-3 tracking-widest uppercase"
                >
                  {item.eyebrow}
                </Typography>
              ) : null}
              <Typography variant="h3" className="mb-4 max-w-xl text-2xl font-bold md:text-3xl">
                {item.title}
              </Typography>
              <Typography
                variant="body1"
                className="text-muted-foreground max-w-xl text-lg leading-relaxed"
              >
                {item.description}
              </Typography>
            </article>
          </div>
        ))}
      </div>
    </div>
  );
}
