"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Typography } from "@/components/ui/typography";
import type { ReactNode } from "react";

export type StickyStoryStep = {
  eyebrow?: string;
  title: string;
  description: string;
  visual?: ReactNode;
};

export type SplitStickyNarrativeProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  steps: StickyStoryStep[];
  stickyVisual?: ReactNode;
  className?: string;
};

// ── Internal step illustrations ──────────────────────────────────────────────

const STEP_PALETTES = [
  {
    from: "from-violet-500/50",
    via: "via-purple-500/30",
    dot: "bg-violet-400",
    bar: "bg-violet-500",
  },
  {
    from: "from-emerald-500/50",
    via: "via-teal-500/30",
    dot: "bg-emerald-400",
    bar: "bg-emerald-500",
  },
  {
    from: "from-sky-500/50",
    via: "via-blue-500/30",
    dot: "bg-sky-400",
    bar: "bg-sky-500",
  },
  {
    from: "from-amber-500/50",
    via: "via-orange-500/30",
    dot: "bg-amber-400",
    bar: "bg-amber-500",
  },
] as const;

type Palette = (typeof STEP_PALETTES)[number];

function NarrativeLines({ p }: { p: Palette }) {
  return (
    <div className="w-full space-y-5 px-2">
      <div className="space-y-2.5">
        <div className={cn("h-3.5 w-4/5 rounded-full opacity-70", p.bar)} />
        <div className={cn("h-3.5 w-3/5 rounded-full opacity-45", p.bar)} />
      </div>
      <div className="space-y-2">
        <div className="bg-foreground/20 h-2 w-full rounded-full" />
        <div className="bg-foreground/15 h-2 w-5/6 rounded-full" />
        <div className="bg-foreground/15 h-2 w-4/6 rounded-full" />
      </div>
      <div className="flex gap-2 pt-1">
        <div className={cn("h-8 w-24 rounded-lg opacity-70", p.bar)} />
        <div className="border-foreground/20 bg-foreground/10 h-8 w-20 rounded-lg border" />
      </div>
    </div>
  );
}

function SectionBlocks({ p }: { p: Palette }) {
  const rows = [
    { label: "Hero", width: "w-full", height: "h-10", prominent: true },
    { label: "Features", width: "w-full", height: "h-8", prominent: false },
    { label: "Pricing", width: "w-full", height: "h-6", prominent: false },
    { label: "FAQ", width: "w-4/5", height: "h-6", prominent: false },
  ];
  return (
    <div className="w-full space-y-2 px-2">
      {rows.map((row, i) => (
        <div
          key={i}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3",
            row.height,
            row.prominent ? cn("opacity-75", p.bar) : "border-foreground/20 bg-foreground/10 border"
          )}
        >
          <div
            className={cn(
              "h-1.5 w-1.5 shrink-0 rounded-full",
              row.prominent ? "bg-white/70" : p.dot
            )}
          />
          <div className={cn("bg-foreground/30 h-1.5 rounded-full", row.width)} />
        </div>
      ))}
    </div>
  );
}

function ConnectionNodes({ p }: { p: Palette }) {
  const nodes = ["Auth", "Forms", "API", "Routes", "Store", "i18n"];
  return (
    <div className="w-full space-y-3 px-2">
      <div
        className={cn(
          "mx-auto flex h-10 w-32 items-center justify-center rounded-xl opacity-65",
          p.bar
        )}
      >
        <div className="h-2 w-20 rounded-full bg-white/50" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {nodes.map((_, i) => (
          <div
            key={i}
            className="border-foreground/20 bg-foreground/10 flex h-8 items-center justify-center rounded-lg border"
          >
            <div className={cn("h-1.5 w-8 rounded-full opacity-80", p.dot)} />
          </div>
        ))}
      </div>
    </div>
  );
}

function GrowthBars({ p }: { p: Palette }) {
  const heights = [20, 32, 28, 48, 40, 64, 56, 80];
  return (
    <div className="w-full px-2">
      <div className="flex h-24 items-end justify-center gap-2">
        {heights.map((h, i) => (
          <div
            key={i}
            className={cn("w-6 rounded-t-sm opacity-75", p.bar)}
            style={{ height: `${h}px` }}
          />
        ))}
      </div>
      <div className="bg-foreground/10 mt-1 h-px w-full" />
    </div>
  );
}

const STEP_ILLUSTRATIONS = [NarrativeLines, SectionBlocks, ConnectionNodes, GrowthBars];

function DefaultVisual({ index, total }: { index: number; total: number }) {
  const p = STEP_PALETTES[index % STEP_PALETTES.length];
  const Illustration = STEP_ILLUSTRATIONS[index % STEP_ILLUSTRATIONS.length];

  return (
    <div
      className={cn("to-muted/60 absolute inset-0 flex flex-col bg-gradient-to-br", p.from, p.via)}
    >
      <div className="flex shrink-0 items-center gap-2 p-6">
        <div className={cn("h-2.5 w-2.5 rounded-full", p.dot)} />
        <div className={cn("h-px w-8 rounded-full opacity-50", p.bar)} />
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center px-6">
        <Illustration p={p} />
      </div>

      <div className="flex shrink-0 gap-1.5 p-6 pt-2">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 rounded-full transition-all duration-500",
              i === index ? cn("w-6", p.dot) : "bg-foreground/15 w-2"
            )}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function SplitStickyNarrative({
  eyebrow,
  title,
  description,
  steps,
  stickyVisual,
  className,
}: SplitStickyNarrativeProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    stepRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveIndex(i);
        },
        { threshold: 0.4 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <div className={cn("relative", className)}>
      <div className="flex flex-col md:flex-row">
        {/* ── Sticky visual panel — desktop only ─────────────── */}
        <div className="hidden md:flex md:w-1/2 md:items-start">
          <div className="sticky top-0 flex h-svh w-full items-center justify-center p-10 lg:p-14">
            <div className="relative w-full max-w-[360px]">
              {/* Vertical step progress indicator */}
              <div className="absolute top-1/2 -right-7 flex -translate-y-1/2 flex-col gap-3">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "rounded-full transition-all duration-500",
                      i === activeIndex ? "bg-foreground h-7 w-1.5" : "bg-foreground/20 h-1.5 w-1.5"
                    )}
                  />
                ))}
              </div>

              {/* Visual card with per-step fade */}
              <div
                className="bg-muted/40 ring-border/40 relative overflow-hidden rounded-3xl border shadow-2xl ring-1"
                style={{ aspectRatio: "3 / 4" }}
              >
                {steps.map((step, i) => (
                  <div
                    key={i}
                    className={cn(
                      "absolute inset-0 transition-opacity duration-500",
                      i === activeIndex ? "opacity-100" : "pointer-events-none opacity-0"
                    )}
                    aria-hidden={i !== activeIndex}
                  >
                    {step.visual ?? stickyVisual ?? (
                      <DefaultVisual index={i} total={steps.length} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Scrollable narrative column ─────────────────────── */}
        <div className="w-full md:w-1/2">
          {/* Section header */}
          <div className="px-8 pt-20 pb-16 md:px-12 md:pt-24">
            {eyebrow && (
              <Typography
                variant="overline"
                className="text-muted-foreground mb-4 block text-xs tracking-[0.2em] uppercase"
              >
                {eyebrow}
              </Typography>
            )}
            <Typography
              variant="h2"
              className="text-3xl leading-tight font-bold md:text-4xl lg:text-5xl"
            >
              {title}
            </Typography>
            {description && (
              <Typography
                variant="body1"
                className="text-muted-foreground mt-5 text-lg leading-relaxed"
              >
                {description}
              </Typography>
            )}
          </div>

          {/* Step cards */}
          {steps.map((step, i) => (
            <div
              key={i}
              ref={(el) => {
                stepRefs.current[i] = el;
              }}
              className="flex min-h-[75svh] flex-col justify-center px-8 py-12 md:px-12"
            >
              {/* Mobile visual */}
              <div
                className="mb-8 overflow-hidden rounded-2xl border md:hidden"
                style={{ aspectRatio: "4 / 3" }}
              >
                {step.visual ?? stickyVisual ?? <DefaultVisual index={i} total={steps.length} />}
              </div>

              {/* Step number + rule */}
              <div className="mb-5 flex items-center gap-4">
                <span
                  className={cn(
                    "font-mono text-xs font-bold tracking-widest transition-colors duration-300",
                    i === activeIndex ? "text-foreground" : "text-foreground/20"
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div
                  className={cn(
                    "h-px flex-1 transition-colors duration-500",
                    i === activeIndex ? "bg-foreground/20" : "bg-foreground/6"
                  )}
                />
              </div>

              {step.eyebrow && (
                <Typography
                  variant="overline"
                  className={cn(
                    "mb-2 block text-xs tracking-[0.15em] uppercase transition-colors duration-300",
                    i === activeIndex ? "text-foreground/50" : "text-foreground/18"
                  )}
                >
                  {step.eyebrow}
                </Typography>
              )}

              <Typography
                variant="h3"
                className={cn(
                  "mb-4 text-2xl leading-snug font-bold transition-colors duration-500 md:text-3xl",
                  i === activeIndex ? "text-foreground" : "text-foreground/20"
                )}
              >
                {step.title}
              </Typography>

              <Typography
                variant="body1"
                className={cn(
                  "text-lg leading-relaxed transition-colors duration-500",
                  i === activeIndex ? "text-muted-foreground" : "text-foreground/18"
                )}
              >
                {step.description}
              </Typography>
            </div>
          ))}

          {/* Trailing spacer keeps last step scrollable to center */}
          <div className="h-24 md:h-36" />
        </div>
      </div>
    </div>
  );
}
