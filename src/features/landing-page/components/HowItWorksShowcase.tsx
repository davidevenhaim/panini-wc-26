"use client";

import { cn } from "@/lib/utils";
import {
  MarketingHowItWorks,
  type HowItWorksStep,
} from "@/components/marketing/MarketingHowItWorks";
import { Typography } from "@/components/ui/typography";

// ── Shared panel shell ────────────────────────────────────────────────────────

function PanelShell({
  title,
  badge,
  children,
  className,
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/80 shadow-2xl",
        className
      )}
    >
      {/* Chrome bar */}
      <div className="flex items-center justify-between border-b border-white/8 bg-neutral-800/60 px-4 py-3">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
        </div>
        <Typography variant="caption1" className="font-mono text-xs text-white/40">
          {title}
        </Typography>
        {badge && (
          <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 font-mono text-[10px] text-indigo-400">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function CodeLine({ indent = 0, children }: { indent?: number; children: React.ReactNode }) {
  return (
    <div style={{ paddingLeft: `${indent * 12}px` }} className="flex items-baseline gap-1">
      {children}
    </div>
  );
}

function Token({ color, children }: { color: string; children: string }) {
  return <span className={color}>{children}</span>;
}

// ── Step 1 — Prompt ───────────────────────────────────────────────────────────

function PromptPanel() {
  const fields = [
    { key: "product", value: '"Skeleton UI"', valueColor: "text-amber-300/80" },
    { key: "audience", value: '"vibe coders, founders"', valueColor: "text-amber-300/80" },
    { key: "tone", value: '"premium · minimal"', valueColor: "text-amber-300/80" },
    { key: "goal", value: '"convert + educate"', valueColor: "text-amber-300/80" },
    { key: "sections", value: '"generating…"', valueColor: "text-indigo-300/80" },
  ];

  return (
    <PanelShell title="product-brief.json" badge="analyzing">
      {/* JSON content */}
      <div className="bg-black/30 px-4 py-4">
        <pre className="text-[12px] leading-6">
          <code>
            <CodeLine>
              <Token color="text-white/40">{"{"}</Token>
            </CodeLine>
            {fields.map(({ key, value, valueColor }) => (
              <CodeLine key={key} indent={1}>
                <Token color="text-white/50">{`"${key}"`}</Token>
                <Token color="text-white/30">{":"}</Token>
                <Token color={valueColor}>{` ${value}`}</Token>
                <Token color="text-white/30">{","}</Token>
              </CodeLine>
            ))}
            <CodeLine>
              <Token color="text-white/40">{"}"}</Token>
            </CodeLine>
          </code>
        </pre>
      </div>

      {/* Log stream */}
      <div className="border-t border-white/6 px-4 py-3">
        <Typography
          variant="caption1"
          className="mb-2 block font-mono text-[10px] tracking-widest text-white/30 uppercase"
        >
          Processing
        </Typography>
        <div className="space-y-1.5">
          {[
            { text: "Analyzing product story…", done: true },
            { text: "Mapping audience signals…", done: true },
            { text: "Building page strategy…", done: true },
            { text: "Generating section brief…", done: false },
          ].map(({ text, done }) => (
            <div key={text} className="flex items-center gap-2">
              <div
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  done ? "bg-green-400" : "animate-pulse bg-indigo-400"
                )}
              />
              <Typography
                variant="caption1"
                className={cn("font-mono text-xs", done ? "text-white/45" : "text-indigo-300/80")}
              >
                {text}
              </Typography>
            </div>
          ))}
        </div>
      </div>
    </PanelShell>
  );
}

// ── Step 2 — Plan ─────────────────────────────────────────────────────────────

function SectionMapPanel() {
  const sections = [
    { id: "hero", component: "MarketingHero", order: "01" },
    { id: "problem", component: "MarketingProblem", order: "02" },
    { id: "proof", component: "MarketingProof", order: "03" },
    { id: "product", component: "MarketingFeatures", order: "04" },
    { id: "pricing", component: "MarketingPricing", order: "05" },
    { id: "faq", component: "MarketingFAQ", order: "06" },
    { id: "cta", component: "MarketingCTA", order: "07" },
  ];

  return (
    <PanelShell title="section-architecture.ts" badge="7 sections">
      <div className="bg-black/30 px-4 py-4">
        <pre className="text-[12px] leading-6">
          <code>
            <CodeLine>
              <Token color="text-indigo-300/70">{"const "}</Token>
              <Token color="text-white/70">{"SECTIONS"}</Token>
              <Token color="text-white/40">{" = ["}</Token>
            </CodeLine>
            {sections.map(({ order, component, id }) => (
              <CodeLine key={id} indent={1}>
                <Token color="text-white/30">{"{ "}</Token>
                <Token color="text-white/45">{"order: "}</Token>
                <Token color="text-amber-300/70">{`"${order}"`}</Token>
                <Token color="text-white/30">{", "}</Token>
                <Token color="text-white/45">{"component: "}</Token>
                <Token color="text-emerald-300/80">{`"${component}"`}</Token>
                <Token color="text-white/30">{" },"}</Token>
              </CodeLine>
            ))}
            <CodeLine>
              <Token color="text-white/40">{"]"}</Token>
            </CodeLine>
          </code>
        </pre>
      </div>

      {/* Architecture summary */}
      <div className="border-t border-white/6 px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {["hero", "problem", "proof", "product", "pricing", "faq", "cta"].map((tag) => (
            <span
              key={tag}
              className="rounded border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-white/40"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </PanelShell>
  );
}

// ── Step 3 — Compose ──────────────────────────────────────────────────────────

function ComposePanel() {
  const components = [
    { name: "MarketingHero", prop: 'title="Build faster."' },
    { name: "MarketingProblem", prop: "" },
    { name: "MarketingFeatures", prop: "" },
    { name: "MarketingPricing", prop: "" },
    { name: "MarketingFAQ", prop: "" },
    { name: "MarketingCTA", prop: "" },
  ];

  return (
    <PanelShell title="app/(marketing)/page.tsx" badge="typed">
      <div className="bg-black/30 px-4 py-4">
        <pre className="text-[12px] leading-6">
          <code>
            <CodeLine>
              <Token color="text-indigo-300/70">{"export default "}</Token>
              <Token color="text-indigo-300/70">{"function "}</Token>
              <Token color="text-white/70">{"LandingPage"}</Token>
              <Token color="text-white/40">{"() {"}</Token>
            </CodeLine>
            <CodeLine indent={1}>
              <Token color="text-indigo-300/70">{"return"}</Token>
              <Token color="text-white/40">{" ("}</Token>
            </CodeLine>
            <CodeLine indent={2}>
              <Token color="text-white/40">{"<"}</Token>
              <Token color="text-indigo-300">{"main"}</Token>
              <Token color="text-white/40">{">"}</Token>
            </CodeLine>
            {components.map(({ name, prop }) => (
              <CodeLine key={name} indent={3}>
                <Token color="text-white/40">{"<"}</Token>
                <Token color="text-emerald-300/80">{name}</Token>
                {prop && <Token color="text-amber-300/60">{` ${prop}`}</Token>}
                <Token color="text-white/40">{" />"}</Token>
              </CodeLine>
            ))}
            <CodeLine indent={2}>
              <Token color="text-white/40">{"</"}</Token>
              <Token color="text-indigo-300">{"main"}</Token>
              <Token color="text-white/40">{">"}</Token>
            </CodeLine>
            <CodeLine indent={1}>
              <Token color="text-white/40">{")"}</Token>
            </CodeLine>
            <CodeLine>
              <Token color="text-white/40">{"}"}</Token>
            </CodeLine>
          </code>
        </pre>
      </div>

      {/* Component count row */}
      <div className="border-t border-white/6 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-1 w-1 rounded-full bg-green-400" />
          <Typography variant="caption1" className="font-mono text-xs text-white/40">
            6 components · typed props · i18n-ready
          </Typography>
        </div>
      </div>
    </PanelShell>
  );
}

// ── Step 4 — Scale ────────────────────────────────────────────────────────────

function ScalePanel() {
  type TreeNode = {
    name: string;
    type: "dir" | "file";
    depth: number;
    connector?: string;
    accent?: boolean;
  };

  const tree: TreeNode[] = [
    { name: "src/", type: "dir", depth: 0 },
    { name: "app/", type: "dir", depth: 1, connector: "├── " },
    { name: "(marketing)/", type: "dir", depth: 2, connector: "│   ├── ", accent: true },
    { name: "page.tsx", type: "file", depth: 3, connector: "│   │   └── " },
    { name: "(dashboard)/", type: "dir", depth: 2, connector: "│   └── " },
    { name: "layout.tsx", type: "file", depth: 3, connector: "│       └── " },
    { name: "components/", type: "dir", depth: 1, connector: "├── " },
    { name: "marketing/", type: "dir", depth: 2, connector: "│   └── ", accent: true },
    { name: "MarketingHero.tsx", type: "file", depth: 3, connector: "│       ├── " },
    { name: "MarketingPricing.tsx", type: "file", depth: 3, connector: "│       ├── " },
    { name: "MarketingFAQ.tsx", type: "file", depth: 3, connector: "│       └── " },
    { name: "features/", type: "dir", depth: 1, connector: "└── " },
    { name: "landing-page/", type: "dir", depth: 2, connector: "    └── ", accent: true },
  ];

  return (
    <PanelShell title="project-structure" badge="scalable">
      <div className="bg-black/30 px-4 py-4">
        <pre className="text-[12px] leading-5">
          <code>
            {tree.map(({ name, type, depth, connector, accent }) => (
              <div key={`${depth}-${name}`} className="flex items-baseline">
                {connector && <span className="text-white/20">{connector}</span>}
                <span
                  className={cn(
                    type === "dir" ? "font-semibold" : "",
                    accent
                      ? "text-indigo-300/80"
                      : type === "dir"
                        ? "text-white/60"
                        : "text-white/35"
                  )}
                >
                  {name}
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>

      {/* Scale indicators */}
      <div className="border-t border-white/6 px-4 py-3">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Routes", value: "clean" },
            { label: "Auth", value: "wired" },
            { label: "Forms", value: "ready" },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2 text-center"
            >
              <Typography
                variant="caption1"
                className="block font-mono text-[10px] tracking-wider text-white/30 uppercase"
              >
                {label}
              </Typography>
              <Typography
                variant="caption1"
                className="mt-0.5 block font-mono text-xs text-green-400/80"
              >
                {value}
              </Typography>
            </div>
          ))}
        </div>
      </div>
    </PanelShell>
  );
}

// ── Showcase steps data ───────────────────────────────────────────────────────

const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    id: "prompt",
    number: "01",
    eyebrow: "Prompt",
    title: "Start with the product story",
    description:
      "Describe the product, audience, tone, and goal. Skeleton turns the idea into a structured landing-page plan instead of a messy one-off page.",
    input: "product idea",
    output: "page brief",
    visual: <PromptPanel />,
  },
  {
    id: "plan",
    number: "02",
    eyebrow: "Plan",
    title: "Map the page before coding",
    description:
      "Turn the idea into a proven section order: hero, problem, proof, product showcase, pricing, FAQ, and final CTA.",
    input: "page brief",
    output: "section architecture",
    visual: <SectionMapPanel />,
  },
  {
    id: "compose",
    number: "03",
    eyebrow: "Compose",
    title: "Build from reusable sections",
    description:
      "Each block is a typed, prop-driven component, so AI can safely edit copy, layout, and content without turning the page into one giant file.",
    input: "section architecture",
    output: "reusable components",
    visual: <ComposePanel />,
  },
  {
    id: "scale",
    number: "04",
    eyebrow: "Scale",
    title: "Grow into a real product",
    description:
      "The landing page evolves beside auth, forms, and dashboards using the same app structure — no rewrite needed when the product grows.",
    input: "reusable components",
    output: "product foundation",
    visual: <ScalePanel />,
  },
];

// ── Showcase entry point ──────────────────────────────────────────────────────

export function HowItWorksShowcase() {
  return (
    <MarketingHowItWorks
      eyebrow="How it works"
      title="How your landing page becomes real product architecture"
      subtitle="Start with a prompt, turn it into reusable sections, and keep scaling without rewriting the page from scratch."
      steps={HOW_IT_WORKS_STEPS}
      defaultActiveStep="prompt"
    />
  );
}
