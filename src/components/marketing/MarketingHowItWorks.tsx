"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import type { ReactNode } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

export type HowItWorksStep = {
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  input?: string;
  output?: string;
  visual?: ReactNode;
};

export type MarketingHowItWorksProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  steps: HowItWorksStep[];
  defaultActiveStep?: string;
  variant?: "dark-workflow" | "light-workflow";
};

// ── Step card ────────────────────────────────────────────────────────────────

type StepCardProps = {
  step: HowItWorksStep;
  isActive: boolean;
  onActivate: () => void;
};

function StepCard({ step, isActive, onActivate }: StepCardProps) {
  return (
    <Button
      variant="ghost"
      size="none"
      role="tab"
      aria-selected={isActive}
      onClick={onActivate}
      onFocus={onActivate}
      onMouseEnter={onActivate}
      className={cn(
        "w-full rounded-xl border p-5 text-left transition-all duration-300 motion-reduce:transition-none",
        "focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:outline-none",
        isActive
          ? [
              "border-indigo-500/35 bg-indigo-500/8",
              "shadow-[0_0_0_1px_rgba(99,102,241,0.15),0_0_24px_rgba(99,102,241,0.08)]",
            ]
          : "border-white/8 bg-white/[0.02] hover:border-white/12 hover:bg-white/[0.04]"
      )}
    >
      <div className="flex w-full items-start gap-4">
        {/* Step number */}
        <span
          className={cn(
            "mt-0.5 shrink-0 font-mono text-xs font-bold transition-colors duration-300 motion-reduce:transition-none",
            isActive ? "text-indigo-400" : "text-white/25"
          )}
        >
          {step.number}
        </span>

        <div className="min-w-0 flex-1">
          {/* Eyebrow */}
          <Typography
            variant="overline"
            className={cn(
              "mb-1 block text-xs tracking-[0.18em] uppercase transition-colors duration-300 motion-reduce:transition-none",
              isActive ? "text-indigo-400/80" : "text-white/30"
            )}
          >
            {step.eyebrow}
          </Typography>

          {/* Title */}
          <Typography
            variant="h6"
            className={cn(
              "mb-2 text-base leading-snug font-semibold transition-colors duration-300 motion-reduce:transition-none",
              isActive ? "text-white" : "text-white/55"
            )}
          >
            {step.title}
          </Typography>

          {/* Description */}
          <Typography
            variant="body2"
            className={cn(
              "text-sm leading-relaxed transition-colors duration-300 motion-reduce:transition-none",
              isActive ? "text-white/55" : "text-white/28"
            )}
          >
            {step.description}
          </Typography>

          {/* Input / Output meta */}
          {(step.input ?? step.output) && (
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
              {step.input && (
                <Typography
                  variant="caption1"
                  className={cn(
                    "font-mono text-xs transition-colors duration-300 motion-reduce:transition-none",
                    isActive ? "text-white/40" : "text-white/18"
                  )}
                >
                  in:{" "}
                  <span className={isActive ? "text-indigo-400/70" : "text-white/25"}>
                    {step.input}
                  </span>
                </Typography>
              )}
              {step.output && (
                <Typography
                  variant="caption1"
                  className={cn(
                    "font-mono text-xs transition-colors duration-300 motion-reduce:transition-none",
                    isActive ? "text-white/40" : "text-white/18"
                  )}
                >
                  out:{" "}
                  <span className={isActive ? "text-indigo-400/70" : "text-white/25"}>
                    {step.output}
                  </span>
                </Typography>
              )}
            </div>
          )}
        </div>

        {/* Active indicator dot */}
        <div
          className={cn(
            "mt-1 h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-300 motion-reduce:transition-none",
            isActive ? "bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.8)]" : "bg-white/15"
          )}
        />
      </div>
    </Button>
  );
}

// ── Default workflow preview panel ───────────────────────────────────────────

type DefaultWorkflowPanelProps = {
  steps: HowItWorksStep[];
  activeId: string;
};

function DefaultWorkflowPanel({ steps, activeId }: DefaultWorkflowPanelProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/80 shadow-2xl">
      {/* Window chrome */}
      <div className="flex items-center justify-between border-b border-white/8 bg-neutral-800/60 px-4 py-3">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
        </div>
        <Typography variant="caption1" className="font-mono text-xs text-white/40">
          landing-workflow
        </Typography>
        <span className="rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5 font-mono text-[10px] text-green-400">
          ready
        </span>
      </div>

      {/* Status row */}
      <div className="border-b border-white/6 px-4 py-3">
        <Typography
          variant="caption1"
          className="mb-2 block font-mono text-[10px] tracking-widest text-white/30 uppercase"
        >
          Status
        </Typography>
        <div className="space-y-1">
          {["workflow.ready", `${steps.length} steps configured`, "architecture.clean"].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-green-400" />
              <Typography variant="caption1" className="font-mono text-xs text-white/50">
                {s}
              </Typography>
            </div>
          ))}
        </div>
      </div>

      {/* Workflow steps list */}
      <div className="border-b border-white/6 px-4 py-3">
        <Typography
          variant="caption1"
          className="mb-2 block font-mono text-[10px] tracking-widest text-white/30 uppercase"
        >
          Workflow
        </Typography>
        <div className="space-y-1">
          {steps.map((step) => {
            const isActive = step.id === activeId;
            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-center justify-between rounded-md px-2 py-1 transition-colors duration-200",
                  isActive ? "bg-indigo-500/10" : ""
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "font-mono text-xs",
                      isActive ? "text-indigo-400" : "text-white/30"
                    )}
                  >
                    {step.number}
                  </span>
                  <Typography
                    variant="caption1"
                    className={cn(
                      "text-xs transition-colors duration-200",
                      isActive ? "text-white/80" : "text-white/35"
                    )}
                  >
                    {step.title}
                  </Typography>
                </div>
                <div
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    isActive ? "bg-indigo-400" : "bg-white/20"
                  )}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Code panel */}
      <div className="border-b border-white/6 bg-black/30 px-4 py-3">
        <div className="mb-2 flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-sm bg-indigo-400/60" />
          <Typography variant="caption1" className="font-mono text-[10px] text-white/30">
            LandingPage.tsx
          </Typography>
        </div>
        <pre className="overflow-x-auto text-[11px] leading-relaxed">
          <code>
            <span className="text-white/30">{"<"}</span>
            <span className="text-indigo-300">{"LandingPage"}</span>
            <span className="text-white/30">{">"}</span>
            {"\n"}
            {[
              "MarketingHero",
              "MarketingProblem",
              "MarketingFeatures",
              "MarketingPricing",
              "MarketingFAQ",
            ].map((comp) => (
              <span key={comp} className="block">
                {"  "}
                <span className="text-white/30">{"<"}</span>
                <span className="text-emerald-300/80">{comp}</span>
                <span className="text-white/30">{" />"}</span>
              </span>
            ))}
            <span className="text-white/30">{"</"}</span>
            <span className="text-indigo-300">{"LandingPage"}</span>
            <span className="text-white/30">{">"}</span>
          </code>
        </pre>
      </div>

      {/* File tree */}
      <div className="px-4 py-3">
        <Typography
          variant="caption1"
          className="mb-2 block font-mono text-[10px] tracking-widest text-white/30 uppercase"
        >
          Project
        </Typography>
        <pre className="text-[11px] leading-relaxed text-white/35">
          <code>{`src/
├── app/
├── components/
│   └── marketing/
├── features/
│   └── landing-page/
└── lib/`}</code>
        </pre>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function MarketingHowItWorks({
  eyebrow = "How it works",
  title,
  subtitle,
  steps,
  defaultActiveStep,
}: MarketingHowItWorksProps) {
  const [activeId, setActiveId] = useState(defaultActiveStep ?? steps[0]?.id ?? "");

  const activeStep = steps.find((s) => s.id === activeId);

  return (
    <section className="relative overflow-hidden bg-neutral-950 text-white">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-10%] left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-500/6 blur-[140px]" />
        <div className="absolute right-[20%] bottom-[-10%] h-[300px] w-[400px] rounded-full bg-violet-500/4 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">
        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center lg:mb-20">
          {eyebrow && (
            <Typography
              variant="overline"
              className="mb-4 block text-xs font-semibold tracking-[0.25em] text-indigo-400 uppercase"
            >
              {eyebrow}
            </Typography>
          )}
          <Typography
            variant="h2"
            className="mb-5 text-3xl font-bold text-white md:text-4xl lg:text-5xl"
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body1"
              className="text-base leading-relaxed text-white/45 md:text-lg"
            >
              {subtitle}
            </Typography>
          )}
        </div>

        {/* Content — 2-col on desktop */}
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-14 xl:gap-20">
          {/* Left: step cards */}
          <div className="space-y-3" role="tablist" aria-label="How it works steps">
            {steps.map((step) => (
              <StepCard
                key={step.id}
                step={step}
                isActive={step.id === activeId}
                onActivate={() => setActiveId(step.id)}
              />
            ))}
          </div>

          {/* Right: sticky preview — desktop only */}
          <div className="hidden lg:block">
            <div className="sticky top-10">
              <div
                role="tabpanel"
                aria-label={activeStep?.title}
                className="transition-all duration-500 motion-reduce:transition-none"
              >
                {activeStep?.visual ?? <DefaultWorkflowPanel steps={steps} activeId={activeId} />}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: preview below steps */}
        <div className="mt-8 lg:hidden">
          {activeStep?.visual ?? <DefaultWorkflowPanel steps={steps} activeId={activeId} />}
        </div>
      </div>
    </section>
  );
}
