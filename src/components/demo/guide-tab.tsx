"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import Iconify from "@/components/ui/iconify";
import { TermTip } from "@/components/ui/term-tip";
import { Typography } from "@/components/ui/typography";
import { AppearIn } from "@/components/ui/animations/appear-in";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { cn } from "@/lib/utils";
import {
  GUIDE_BONUS_ITEMS,
  GUIDE_CHECKLIST_GROUPS,
  GUIDE_IGNORE_FILES,
  GUIDE_TROUBLESHOOTING,
  PRODUCT_GUIDE_CREDITS,
  PRODUCT_GUIDE_GOOD_FIT,
  PRODUCT_GUIDE_LESS_SUITABLE,
  PRODUCT_GUIDE_PURPOSE_POINTS,
  PRODUCT_GUIDE_RESOURCES,
  type GuideChecklistItemDef,
} from "@/components/demo/data";
import { GUIDE_SECTION_ID } from "@/constants/guide-sections.constants";

const CHECKLIST_TERM_TIP_KEYS = [
  "terminal",
  "lts",
  "packageManager",
  "codeEditor",
  "github",
  "localhost",
  "envFile",
  "git",
  "javascript",
] as const;

type ChecklistTermTipKey = (typeof CHECKLIST_TERM_TIP_KEYS)[number];

function richChunksToPlainString(chunks: React.ReactNode): string {
  if (chunks == null || chunks === false) return "";
  if (typeof chunks === "string" || typeof chunks === "number") return String(chunks);
  if (Array.isArray(chunks)) return chunks.map(richChunksToPlainString).join("");
  return "";
}

export function DemoGuideTab() {
  const pathname = usePathname();
  const tProductGuide = useTranslations("demo.productGuide");

  const [troubleshootingAccordion, setTroubleshootingAccordion] = React.useState<
    string | undefined
  >(undefined);
  const [ignoreAccordion, setIgnoreAccordion] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    const syncHash = () => {
      const raw = window.location.hash.replace(/^#/, "");
      if (!raw) return;
      const id = decodeURIComponent(raw);
      if (id === GUIDE_SECTION_ID.troubleshooting) {
        setTroubleshootingAccordion("troubleshooting");
      }
      if (id === GUIDE_SECTION_ID.ignoreAtFirst) {
        setIgnoreAccordion("ignore-at-first");
      }
      window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    };

    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);

  const checklistTermTipRich = React.useMemo(() => {
    const map = {} as Record<ChecklistTermTipKey, (chunks: React.ReactNode) => React.ReactNode>;
    for (const key of CHECKLIST_TERM_TIP_KEYS) {
      map[key] = (chunks: React.ReactNode) => (
        <TermTip
          term={richChunksToPlainString(chunks) || tProductGuide(`checklist.vibeTerms.${key}.term`)}
          explanation={tProductGuide(`checklist.vibeTerms.${key}.explanation`)}
          className="text-inherit"
          side="top"
        />
      );
    }
    return map;
  }, [tProductGuide]);
  const { copy } = useCopyToClipboard();
  const [lastCopied, setLastCopied] = React.useState<string | null>(null);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const { state: checked, setState: setChecked } = useLocalStorage<Record<string, boolean>>(
    "guide-setup-checklist",
    {} as Record<string, boolean>
  );

  const resourcesById = React.useMemo(
    () => new Map(PRODUCT_GUIDE_RESOURCES.map((r) => [r.id, r])),
    []
  );

  const allChecklistItems = React.useMemo(() => GUIDE_CHECKLIST_GROUPS.flatMap((g) => g.items), []);
  const requiredTotal = allChecklistItems.filter((i) => i.required).length;
  const requiredDone = allChecklistItems.filter((i) => i.required && checked[i.id]).length;
  const progressPct = requiredTotal > 0 ? Math.round((requiredDone / requiredTotal) * 100) : 0;
  const allDone = requiredDone === requiredTotal;

  const handleCopy = React.useCallback(
    async (key: string, value: string) => {
      await copy(value);
      setLastCopied(key);
      window.setTimeout(() => {
        setLastCopied((current) => (current === key ? null : current));
      }, 2000);
    },
    [copy]
  );

  const renderCommandBlocks = React.useCallback(
    (stepId: string, commands?: string[]) =>
      commands?.map((command, commandIndex) => {
        const copyKey = `step-${stepId}-${commandIndex}`;

        return (
          <div
            key={copyKey}
            className="border-border/70 bg-muted/40 space-y-2 rounded-xl border border-dashed p-3"
          >
            <Typography
              variant="caption2"
              as="span"
              className="text-muted-foreground block text-xs font-medium tracking-wide uppercase"
            >
              {tProductGuide("actions.commandLabel")}
            </Typography>
            <code className="bg-background text-foreground block rounded-md px-2 py-1.5 text-xs break-all">
              {command}
            </code>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => handleCopy(copyKey, command)}
            >
              <Iconify
                icon={lastCopied === copyKey ? "lucide:check" : "lucide:copy"}
                className="size-4"
              />
              {lastCopied === copyKey
                ? tProductGuide("actions.copied")
                : tProductGuide("actions.copyCommand")}
            </Button>
          </div>
        );
      }),
    [handleCopy, lastCopied, tProductGuide]
  );

  const renderChecklistItem = React.useCallback(
    (item: GuideChecklistItemDef) => {
      const isChecked = Boolean(checked[item.id]);
      const isExpanded = expandedId === item.id;
      const resource = item.resourceId ? resourcesById.get(item.resourceId) : undefined;

      return (
        <div
          key={item.id}
          className={cn(
            "border-border/40 border-b transition-colors duration-150 last:border-0",
            isChecked && "bg-muted/20"
          )}
        >
          {/* Row header — div not button because Checkbox (Radix) is already a <button> */}
          <div
            role="button"
            tabIndex={0}
            className="hover:bg-muted/30 flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 text-left transition-colors"
            onClick={() => setExpandedId((prev) => (prev === item.id ? null : item.id))}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setExpandedId((prev) => (prev === item.id ? null : item.id));
              }
            }}
          >
            <Checkbox
              checked={isChecked}
              onCheckedChange={() => {
                setChecked({ [item.id]: !isChecked });
              }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="shrink-0"
            />
            <Iconify
              icon={item.icon}
              className={cn("size-4 shrink-0", isChecked && "opacity-40")}
            />
            <Typography
              variant="label1"
              className={cn(
                "flex-1 text-sm font-medium",
                isChecked
                  ? "text-muted-foreground decoration-muted-foreground/40 line-through"
                  : "text-foreground"
              )}
            >
              {tProductGuide(`checklist.items.${item.id}.title`)}
            </Typography>
            <div className="flex shrink-0 items-center gap-2">
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs font-medium",
                  !item.required &&
                    "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300"
                )}
              >
                {item.required
                  ? tProductGuide("checklist.requiredBadge")
                  : tProductGuide("checklist.bonusBadge")}
              </Badge>
              <Iconify
                icon={isExpanded ? "lucide:chevron-up" : "lucide:chevron-down"}
                className="text-muted-foreground size-4 shrink-0"
              />
            </div>
          </div>

          {/* Expanded panel */}
          {isExpanded && (
            <div className="border-border/30 bg-muted/10 space-y-3 border-t px-4 pt-3 pb-4">
              <Typography
                variant="caption2"
                className="text-muted-foreground text-sm leading-relaxed"
              >
                {tProductGuide.rich(`checklist.items.${item.id}.description`, checklistTermTipRich)}
              </Typography>

              {/* Verify command */}
              {item.checkCommand && (
                <div className="space-y-1.5">
                  <Typography
                    variant="caption2"
                    className="text-muted-foreground block text-xs font-medium tracking-wide uppercase"
                  >
                    {tProductGuide.rich("checklist.checkLabel", checklistTermTipRich)}
                  </Typography>
                  <div className="flex items-center gap-2">
                    <code className="bg-background text-foreground min-w-0 flex-1 rounded-md border px-2 py-1.5 text-xs break-all">
                      {item.checkCommand}
                    </code>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="size-7 shrink-0 p-0"
                      onClick={() => handleCopy(`chk-${item.id}`, item.checkCommand!)}
                    >
                      <Iconify
                        icon={lastCopied === `chk-${item.id}` ? "lucide:check" : "lucide:copy"}
                        className="size-3.5"
                      />
                    </Button>
                  </div>
                  {item.expectedOutput && (
                    <Typography variant="caption2" className="text-muted-foreground text-xs">
                      {tProductGuide("checklist.expectedLabel")}{" "}
                      <code className="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs font-medium">
                        {item.expectedOutput}
                      </code>
                    </Typography>
                  )}
                </div>
              )}

              {/* Editor: VS Code or Cursor */}
              {item.id === "editor" && (
                <div className="space-y-1.5">
                  <Typography
                    variant="caption2"
                    className="text-muted-foreground block text-xs font-medium tracking-wide uppercase"
                  >
                    {tProductGuide("checklist.installOptionsLabel")}
                  </Typography>
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    {(["vscode", "cursor"] as const).map((editorId, i) => {
                      const editorRes = resourcesById.get(editorId);
                      if (!editorRes) return null;
                      return (
                        <React.Fragment key={editorId}>
                          {i === 1 && (
                            <Typography
                              variant="caption2"
                              className="text-muted-foreground text-center text-xs font-medium"
                            >
                              {tProductGuide("checklist.orVersus")}
                            </Typography>
                          )}
                          <Link
                            href={editorRes.href}
                            target="_blank"
                            rel="noreferrer"
                            className="border-border/60 bg-background hover:border-primary/30 hover:bg-accent/40 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all duration-200 hover:-translate-y-0.5"
                          >
                            <Iconify icon={editorRes.icon} className="size-4 shrink-0" />
                            <Typography
                              variant="label1"
                              className="text-foreground min-w-0 flex-1 truncate text-xs font-medium"
                            >
                              {tProductGuide(`resources.items.${editorId}.title`)}
                            </Typography>
                            <Iconify
                              icon="lucide:arrow-up-right"
                              className="text-primary size-3 shrink-0"
                            />
                          </Link>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Install link (non-editor items with a resource) */}
              {resource && item.id !== "editor" && (
                <div className="space-y-1.5">
                  {item.checkCommand && (
                    <Typography
                      variant="caption2"
                      className="text-muted-foreground block text-xs font-medium tracking-wide uppercase"
                    >
                      {tProductGuide("checklist.notInstalledLabel")}
                    </Typography>
                  )}
                  <Link
                    href={resource.href}
                    target="_blank"
                    rel="noreferrer"
                    className="border-border/60 bg-background hover:border-primary/30 hover:bg-accent/40 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <Iconify icon={resource.icon} className="size-4 shrink-0" />
                    <Typography variant="label1" className="text-foreground font-medium">
                      {tProductGuide(`resources.items.${resource.id}.title`)}
                    </Typography>
                    <Iconify
                      icon="lucide:arrow-up-right"
                      className="text-primary ml-2 size-3.5 shrink-0"
                    />
                  </Link>
                </div>
              )}

              {/* Install command (e.g. pnpm via npm) */}
              {item.installCommand && (
                <div className="space-y-1.5">
                  <Typography
                    variant="caption2"
                    className="text-muted-foreground block text-xs font-medium tracking-wide uppercase"
                  >
                    {tProductGuide("checklist.installCommandLabel")}
                  </Typography>
                  <div className="flex items-center gap-2">
                    <code className="bg-background text-foreground min-w-0 flex-1 rounded-md border px-2 py-1.5 text-xs break-all">
                      {item.installCommand}
                    </code>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="size-7 shrink-0 p-0"
                      onClick={() => handleCopy(`icmd-${item.id}`, item.installCommand!)}
                    >
                      <Iconify
                        icon={lastCopied === `icmd-${item.id}` ? "lucide:check" : "lucide:copy"}
                        className="size-3.5"
                      />
                    </Button>
                  </div>
                </div>
              )}

              {/* Setup / run commands */}
              {item.commands && item.commands.length > 0 && (
                <div className="space-y-2">
                  <Typography
                    variant="caption2"
                    className="text-muted-foreground block text-xs font-medium tracking-wide uppercase"
                  >
                    {tProductGuide.rich("checklist.commandLabel", checklistTermTipRich)}
                  </Typography>
                  {item.commands.map((cmd, i) => {
                    const ck = `cmd-${item.id}-${i}`;
                    return (
                      <div key={ck} className="flex items-center gap-2">
                        <code className="bg-background text-foreground min-w-0 flex-1 rounded-md border px-2 py-1.5 text-xs break-all">
                          {cmd}
                        </code>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="size-7 shrink-0 p-0"
                          onClick={() => handleCopy(ck, cmd)}
                        >
                          <Iconify
                            icon={lastCopied === ck ? "lucide:check" : "lucide:copy"}
                            className="size-3.5"
                          />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* "run" step: extra note with localhost link */}
              {item.id === "run" && (
                <div className="border-primary/15 bg-primary/5 rounded-lg border px-3 py-2">
                  <Typography variant="caption2" className="text-muted-foreground text-xs">
                    {tProductGuide.rich("howToUse.steps.startProject.note", {
                      code: (chunks) => (
                        <code className="bg-background text-foreground rounded px-1.5 py-0.5 text-xs">
                          {chunks}
                        </code>
                      ),
                      link: (chunks) => (
                        <Link
                          href="http://localhost:3000"
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary font-medium underline underline-offset-4"
                        >
                          {chunks}
                        </Link>
                      ),
                    })}
                  </Typography>
                </div>
              )}
            </div>
          )}
        </div>
      );
    },
    [
      checked,
      expandedId,
      handleCopy,
      lastCopied,
      resourcesById,
      setChecked,
      tProductGuide,
      checklistTermTipRich,
    ]
  );

  return (
    <div className="space-y-10">
      {/* 1. Hero */}
      <section
        id={GUIDE_SECTION_ID.getStarted}
        className="from-primary/10 via-background to-background relative scroll-mt-24 overflow-hidden rounded-2xl border bg-gradient-to-br p-8 shadow-sm md:p-10 rtl:bg-gradient-to-bl"
      >
        <div className="from-primary/5 pointer-events-none absolute inset-y-0 end-0 w-1/2 bg-gradient-to-l to-transparent rtl:bg-gradient-to-r" />
        <div className="relative space-y-4">
          <Badge variant="secondary" className="text-xs font-medium">
            {tProductGuide("eyebrow")}
          </Badge>
          <Typography
            variant="h2"
            as="h1"
            className="text-foreground text-4xl font-bold tracking-tight md:text-5xl"
          >
            {tProductGuide("title")}
          </Typography>
          <Typography variant="body2" className="text-muted-foreground leading-relaxed">
            {tProductGuide("subtitle")}
          </Typography>
        </div>
      </section>

      {/* 2. Interactive Setup Checklist */}
      <section id={GUIDE_SECTION_ID.setupChecklist} className="scroll-mt-24 space-y-5">
        {/* Header + progress counter */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <Typography
              variant="subtitle1"
              as="h2"
              className="text-foreground text-2xl font-semibold tracking-tight"
            >
              {tProductGuide("checklist.title")}
            </Typography>
            <Typography variant="caption1" className="text-muted-foreground">
              {tProductGuide("checklist.description")}
            </Typography>
          </div>
          <Typography
            variant="label1"
            className={cn(
              "shrink-0 text-sm font-bold tabular-nums",
              allDone ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
            )}
          >
            {tProductGuide("checklist.progress", {
              done: requiredDone,
              total: requiredTotal,
            })}
          </Typography>
        </div>

        {/* Progress bar */}
        <Progress
          value={progressPct}
          className={cn("h-2.5", allDone && "[&>[data-slot=progress-indicator]]:bg-emerald-500")}
        />

        {/* All done banner */}
        {allDone && (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
            <Iconify
              icon="lucide:circle-check"
              className="mt-0.5 size-5 shrink-0 text-emerald-500"
            />
            <div className="flex-1 space-y-1.5">
              <Typography variant="label1" className="text-foreground text-sm font-semibold">
                {tProductGuide("checklist.allDone")}
              </Typography>
              <Link
                href="http://localhost:3000"
                target="_blank"
                rel="noreferrer"
                className="text-primary inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4"
              >
                {tProductGuide("checklist.openApp")}
                <Iconify icon="lucide:arrow-up-right" className="size-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Checklist groups — accordion */}
        <Accordion
          type="multiple"
          defaultValue={GUIDE_CHECKLIST_GROUPS.map((g) => g.id)}
          className="space-y-3"
        >
          {GUIDE_CHECKLIST_GROUPS.map((group) => {
            const groupDone = group.items.filter((i) => checked[i.id]).length;
            return (
              <Card key={group.id} className="border-border/70 overflow-hidden p-0">
                <AccordionItem value={group.id} className="border-0">
                  <AccordionTrigger className="hover:bg-accent/40 border-border/40 bg-muted/40 data-[state=open]:border-border/40 flex cursor-pointer items-center gap-2 border-b px-4 py-2.5 hover:no-underline data-[state=open]:border-b">
                    <Iconify icon={group.icon} className="text-muted-foreground size-4 shrink-0" />
                    <Typography
                      variant="subtitle2"
                      as="span"
                      className="text-foreground flex-1 text-left text-sm font-semibold"
                    >
                      {tProductGuide(`checklist.groups.${group.id}`)}
                    </Typography>
                    <Typography
                      variant="caption2"
                      as="span"
                      className={cn(
                        "me-1 text-xs font-medium tabular-nums",
                        groupDone === group.items.length
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-muted-foreground"
                      )}
                    >
                      {groupDone}/{group.items.length}
                    </Typography>
                  </AccordionTrigger>
                  <AccordionContent className="pb-0">
                    <div>{group.items.map((item) => renderChecklistItem(item))}</div>
                  </AccordionContent>
                </AccordionItem>
              </Card>
            );
          })}
        </Accordion>

        {/* Bonus section */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="bg-border/50 h-px flex-1" />
            <Badge
              variant="outline"
              className="border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
            >
              ⭐ {tProductGuide("checklist.bonusTitle")}
            </Badge>
            <div className="bg-border/50 h-px flex-1" />
          </div>
          <Typography variant="caption2" className="text-muted-foreground text-center text-xs">
            {tProductGuide("checklist.bonusDescription")}
          </Typography>
          <Card className="border-border/70 overflow-hidden">
            <div>{GUIDE_BONUS_ITEMS.map((item) => renderChecklistItem(item))}</div>
          </Card>
        </div>
      </section>

      {/* Reset tip */}
      {(() => {
        const RESET_PROMPT = [
          "Delete demo content by following `.claude/rules/reset.md`.",
          "",
          "Important: treat the delete list in Step 1 as an allowlist. Do not delete extra files or directories.",
          "",
          "Do NOT delete:",
          "- `src/app/page.tsx` (only edit it as the reset guide instructs)",
          "- `public/landing-page/globe.png`",
          "- `public/landing-page/globe-light.png`",
          "- the `home` translation key in any locale",
          "- shared infrastructure under `src/components/ui`, `src/components/form`, `src/hooks`, `src/lib`, `src/store`, `src/utils`, `src/i18n`",
          "",
          "Do delete `public/lottie/lottie-demo.json`.",
          "",
          "After cleanup:",
          "- remove `.next`",
          "- run `pnpm build`",
          "- run `pnpm test`",
          "- search for remaining imports/references to deleted demo/contact/landing-demo files",
          "- remove the homepage GitHub and showcase buttons from `src/app/page.tsx`, including `GITHUB_URL`, `WEB_ROUTES.DEMO_GUIDE`, and their translation keys",
          "- verify `src/app/page.tsx` still renders `home.startHere`",
        ].join("\n");
        const RESET_PROMPT_PREVIEW = `${RESET_PROMPT.split("\n").filter(Boolean).slice(0, 2).join("\n")}\n.....`;
        const copyKey = "reset-tip-prompt";
        return (
          <div className="border-border/60 bg-muted/30 space-y-3 rounded-2xl border p-5">
            <div className="flex items-center gap-2">
              <Iconify icon="lucide:wand-2" className="text-muted-foreground size-4 shrink-0" />
              <Typography variant="subtitle2" as="h3" className="text-foreground font-semibold">
                {tProductGuide("resetTip.title")}
              </Typography>
            </div>
            <Typography variant="caption1" className="text-muted-foreground">
              {tProductGuide("resetTip.description")}
            </Typography>
            <div className="border-border/70 bg-muted/40 space-y-2 rounded-xl border border-dashed p-3">
              <Typography
                variant="caption2"
                as="span"
                className="text-muted-foreground block text-xs font-medium tracking-wide uppercase"
              >
                {tProductGuide("resetTip.promptLabel")}
              </Typography>
              <code className="bg-background text-foreground block rounded-md px-2 py-1.5 text-xs leading-relaxed whitespace-pre-line select-none">
                {RESET_PROMPT_PREVIEW}
              </code>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => handleCopy(copyKey, RESET_PROMPT)}
              >
                <Iconify
                  icon={lastCopied === copyKey ? "lucide:check" : "lucide:copy"}
                  className="size-4"
                />
                {lastCopied === copyKey
                  ? tProductGuide("actions.copied")
                  : tProductGuide("actions.copyCommand")}
              </Button>
            </div>
          </div>
        );
      })()}

      {/* 3. Troubleshooting */}
      <section id={GUIDE_SECTION_ID.troubleshooting} className="scroll-mt-24">
        <Accordion
          type="single"
          collapsible
          value={troubleshootingAccordion}
          onValueChange={setTroubleshootingAccordion}
        >
          <AccordionItem
            value="troubleshooting"
            className="border-border/70 bg-muted/45 dark:bg-muted/20 hover:border-primary/25 rounded-2xl border px-4 transition-colors"
          >
            <AccordionTrigger className="hover:bg-accent/55 dark:hover:bg-accent/20 -mx-2 cursor-pointer rounded-xl px-2 py-5 no-underline hover:no-underline">
              <div className="flex items-center gap-2">
                <Iconify
                  icon="lucide:triangle-alert"
                  className="text-muted-foreground size-4 shrink-0"
                />
                <Typography variant="subtitle1" as="span" className="text-foreground font-semibold">
                  {tProductGuide("howToUse.troubleshooting.title")}
                </Typography>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2 pb-6">
              <Typography variant="caption1" className="text-muted-foreground max-w-4xl">
                {tProductGuide("howToUse.troubleshooting.description")}
              </Typography>
              <Card className="border-border/70">
                <CardContent className="p-0">
                  <div className="divide-border/60 divide-y">
                    {GUIDE_TROUBLESHOOTING.map((item) => (
                      <div key={item.id} className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
                        <div className="flex items-start gap-2">
                          <Iconify
                            icon="lucide:triangle-alert"
                            className="mt-0.5 size-4 shrink-0 text-amber-500"
                          />
                          <Typography
                            variant="caption1"
                            className="text-foreground text-sm font-medium"
                          >
                            {tProductGuide(`howToUse.troubleshooting.items.${item.id}.problem`)}
                          </Typography>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <Iconify
                              icon="lucide:circle-check"
                              className="text-primary mt-0.5 size-4 shrink-0"
                            />
                            <Typography
                              variant="caption1"
                              className="text-muted-foreground text-sm"
                            >
                              {tProductGuide(`howToUse.troubleshooting.items.${item.id}.fix`)}
                            </Typography>
                          </div>
                          {item.command && (
                            <div>
                              {renderCommandBlocks(`troubleshoot-${item.id}`, [item.command])}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* 4. Why */}
      <section id={GUIDE_SECTION_ID.purpose} className="scroll-mt-24 space-y-6">
        <div className="max-w-4xl space-y-2">
          <Typography
            variant="subtitle1"
            as="h2"
            className="text-foreground text-2xl font-semibold tracking-tight"
          >
            {tProductGuide("purpose.title")}
          </Typography>
          <Typography variant="caption1" className="text-muted-foreground">
            {tProductGuide("purpose.description")}
          </Typography>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {PRODUCT_GUIDE_PURPOSE_POINTS.map((item, index) => (
            <AppearIn key={item.id} delay={index * 75}>
              <Card className="border-border/70 h-full">
                <CardContent className="space-y-3 p-5">
                  <div
                    className={cn(
                      "bg-muted flex size-10 items-center justify-center rounded-xl",
                      item.color
                    )}
                  >
                    <Iconify icon={item.icon} className="size-5" />
                  </div>
                  <Typography
                    variant="subtitle2"
                    as="h3"
                    className="text-foreground text-lg font-semibold"
                  >
                    {tProductGuide(`purpose.points.${item.id}.title`)}
                  </Typography>
                  <Typography variant="caption1" className="text-muted-foreground">
                    {tProductGuide(`purpose.points.${item.id}.description`)}
                  </Typography>
                </CardContent>
              </Card>
            </AppearIn>
          ))}
        </div>
      </section>

      {/* 5. When */}
      <section
        id={GUIDE_SECTION_ID.whenToUse}
        className="grid scroll-mt-24 grid-cols-1 gap-6 lg:grid-cols-2"
      >
        <Card id={GUIDE_SECTION_ID.goodFit} className="border-border/70 scroll-mt-24">
          <CardContent className="space-y-5 p-6">
            <div className="space-y-2">
              <Typography
                variant="subtitle1"
                as="h2"
                className="text-foreground text-2xl font-semibold tracking-tight"
              >
                {tProductGuide("goodFit.title")}
              </Typography>
              <Typography variant="caption1" className="text-muted-foreground">
                {tProductGuide("goodFit.description")}
              </Typography>
            </div>
            <div className="space-y-3">
              {PRODUCT_GUIDE_GOOD_FIT.map((item) => (
                <div
                  key={item.id}
                  className="border-border/60 bg-background flex items-start gap-3 rounded-xl border p-4"
                >
                  <div
                    className={cn(
                      "bg-muted mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg",
                      item.color
                    )}
                  >
                    <Iconify icon={item.icon} className="size-4" />
                  </div>
                  <div className="space-y-1">
                    <Typography
                      variant="label1"
                      as="h3"
                      className="text-foreground text-base font-medium"
                    >
                      {tProductGuide(`goodFit.items.${item.id}.title`)}
                    </Typography>
                    <Typography variant="caption1" className="text-muted-foreground">
                      {tProductGuide(`goodFit.items.${item.id}.description`)}
                    </Typography>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card id={GUIDE_SECTION_ID.lessSuitable} className="border-border/70 scroll-mt-24">
          <CardContent className="space-y-5 p-6">
            <div className="space-y-2">
              <Typography
                variant="subtitle1"
                as="h2"
                className="text-foreground text-2xl font-semibold tracking-tight"
              >
                {tProductGuide("lessSuitable.title")}
              </Typography>
              <Typography variant="caption1" className="text-muted-foreground">
                {tProductGuide("lessSuitable.description")}
              </Typography>
            </div>
            <div className="space-y-3">
              {PRODUCT_GUIDE_LESS_SUITABLE.map((item) => (
                <div
                  key={item.id}
                  className="border-border/60 bg-background flex items-start gap-3 rounded-xl border p-4"
                >
                  <div
                    className={cn(
                      "bg-muted mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg",
                      item.color
                    )}
                  >
                    <Iconify icon={item.icon} className="size-4" />
                  </div>
                  <div className="space-y-1">
                    <Typography
                      variant="label1"
                      as="h3"
                      className="text-foreground text-base font-medium"
                    >
                      {tProductGuide(`lessSuitable.items.${item.id}.title`)}
                    </Typography>
                    <Typography variant="caption1" className="text-muted-foreground">
                      {tProductGuide(`lessSuitable.items.${item.id}.description`)}
                    </Typography>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 6. What you can safely ignore */}
      <section id={GUIDE_SECTION_ID.ignoreAtFirst} className="scroll-mt-24">
        <Accordion
          type="single"
          collapsible
          value={ignoreAccordion}
          onValueChange={setIgnoreAccordion}
        >
          <AccordionItem
            value="ignore-at-first"
            className="border-border/70 bg-muted/45 dark:bg-muted/20 hover:border-primary/25 rounded-2xl border px-4 transition-colors"
          >
            <AccordionTrigger className="hover:bg-accent/55 dark:hover:bg-accent/20 -mx-2 cursor-pointer rounded-xl px-2 py-5 no-underline hover:no-underline">
              <div className="flex items-center gap-2">
                <Iconify icon="lucide:folder-open" className="text-muted-foreground size-4" />
                <Typography variant="subtitle1" as="span" className="text-foreground font-semibold">
                  {tProductGuide("ignoreAtFirst.title")}
                </Typography>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2 pb-6">
              <Typography variant="caption1" className="text-muted-foreground max-w-4xl">
                {tProductGuide("ignoreAtFirst.description")}
              </Typography>
              <Card className="border-border/70">
                <CardContent className="p-0">
                  <div className="divide-border/60 divide-y">
                    {GUIDE_IGNORE_FILES.map((item, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 gap-1 p-4 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
                      >
                        <code className="text-foreground self-start rounded bg-transparent px-0 text-sm font-medium">
                          {item.file}
                        </code>
                        <Typography variant="caption1" className="text-muted-foreground">
                          {item.reason}
                        </Typography>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <div className="border-border/60 bg-muted/30 flex items-start gap-3 rounded-xl border p-4">
                <Iconify
                  icon="lucide:triangle-alert"
                  className="mt-0.5 size-4 shrink-0 text-amber-500"
                />
                <Typography variant="caption1" className="text-muted-foreground">
                  {tProductGuide("ignoreAtFirst.doNotRemove")}
                </Typography>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* 7. Built with */}
      <section id={GUIDE_SECTION_ID.builtWith} className="scroll-mt-24 space-y-6">
        <div className="max-w-4xl space-y-2">
          <Typography
            variant="subtitle1"
            as="h2"
            className="text-foreground text-2xl font-semibold tracking-tight"
          >
            {tProductGuide("builtWith.title")}
          </Typography>
          <Typography variant="caption1" className="text-muted-foreground">
            {tProductGuide("builtWith.description")}
          </Typography>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {PRODUCT_GUIDE_CREDITS.map((item, index) => (
            <AppearIn key={item.id} delay={index * 60}>
              <Card className="border-border/70 h-full">
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "bg-muted flex size-10 shrink-0 items-center justify-center rounded-xl",
                        item.color
                      )}
                    >
                      <Iconify icon={item.icon} className="size-5" />
                    </div>
                    <div className="space-y-1">
                      <Typography
                        variant="subtitle2"
                        as="h3"
                        className="text-foreground text-lg font-semibold"
                      >
                        {tProductGuide(`builtWith.items.${item.id}.name`)}
                      </Typography>
                      <Typography variant="caption1" className="text-muted-foreground">
                        {tProductGuide(`builtWith.items.${item.id}.description`)}
                      </Typography>
                    </div>
                  </div>
                  <Link
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary inline-flex items-center gap-2 text-sm font-medium"
                  >
                    <Typography
                      variant="caption2"
                      as="span"
                      className="text-primary text-sm font-medium"
                    >
                      {tProductGuide("builtWith.linkLabel")}
                    </Typography>
                    <Iconify icon="lucide:arrow-up-right" className="size-4" />
                  </Link>
                </CardContent>
              </Card>
            </AppearIn>
          ))}
        </div>
      </section>
    </div>
  );
}
