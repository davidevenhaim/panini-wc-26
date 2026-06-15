"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { CommandDialog, type CommandDialogItem } from "@/components/ui/command-dialog";
import { FadeInOnChange } from "@/components/ui/fade-in";
import { Badge } from "@/components/ui/badge";
import Iconify from "@/components/ui/iconify";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { NotificationDropdown, type NotificationItem } from "@/components/ui/notification-dropdown";
import { Spinner } from "@/components/ui/spinner";
import { Stepper } from "@/components/ui/stepper";
import { TestimonialCard } from "@/components/ui/testimonial-card";
import { Timeline } from "@/components/ui/timeline";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Typography } from "@/components/ui/typography";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

function ShowcaseBlock({
  title,
  children,
  hint,
}: {
  title: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-3">
      <Typography variant="label2" as="p" color="muted">
        {title}
      </Typography>
      {hint && (
        <Typography variant="caption2" as="p" color="muted" className="max-w-5xl">
          {hint}
        </Typography>
      )}
      <div className="border-border/60 bg-background rounded-xl border p-4">{children}</div>
    </div>
  );
}

function ShowcaseInlineItem({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-3 text-center",
        className
      )}
    >
      <Typography variant="caption2" as="p" color="muted" className="font-medium">
        {label}
      </Typography>
      {children}
    </div>
  );
}

export function ViewIdentityControlsRow() {
  const t = useTranslations("demo.typography.showcase");

  const notifications = React.useMemo<NotificationItem[]>(
    () => [
      {
        id: "1",
        title: t("notification1Title"),
        body: t("notification1Body"),
        time: t("notification1Time"),
        unread: true,
      },
      {
        id: "2",
        title: t("notification2Title"),
        body: t("notification2Body"),
        time: t("notification2Time"),
      },
    ],
    [t]
  );

  return (
    <ShowcaseBlock title={t("identityControlsRowTitle")} hint={t("identityControlsRowHint")}>
      <div className="flex flex-col items-stretch gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <ShowcaseInlineItem label={t("avatarTitle")}>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Avatar>
              <AvatarImage src="https://api.dicebear.com/9.x/avataaars/svg?seed=Ada" alt="" />
              <AvatarFallback>AD</AvatarFallback>
              <AvatarBadge className="bg-emerald-500" />
            </Avatar>
            <AvatarGroup>
              <Avatar size="sm">
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <Avatar size="sm">
                <AvatarFallback>B</AvatarFallback>
              </Avatar>
              <Avatar size="sm">
                <AvatarFallback>C</AvatarFallback>
              </Avatar>
              <AvatarGroupCount>+4</AvatarGroupCount>
            </AvatarGroup>
          </div>
        </ShowcaseInlineItem>

        <ShowcaseInlineItem label={t("toggleGroupTitle")}>
          <ToggleGroup type="single" defaultValue="list" variant="outline">
            <ToggleGroupItem value="list" aria-label={t("toggleList")}>
              <Iconify icon="lucide:list" className="size-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" aria-label={t("toggleGrid")}>
              <Iconify icon="lucide:layout-grid" className="size-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </ShowcaseInlineItem>

        <ShowcaseInlineItem label={t("notificationTitle")}>
          <NotificationDropdown items={notifications} />
        </ShowcaseInlineItem>
      </div>
    </ShowcaseBlock>
  );
}

export function ViewNavigationSection() {
  const t = useTranslations("demo.typography.showcase");
  const [page, setPage] = React.useState(2);
  const [commandOpen, setCommandOpen] = React.useState(false);

  const commandItems = React.useMemo<CommandDialogItem[]>(
    () => [
      { id: "home", label: t("commandItemHome"), group: t("commandGroupNav"), shortcut: "⌘H" },
      { id: "settings", label: t("commandItemSettings"), group: t("commandGroupNav") },
      { id: "docs", label: t("commandItemDocs"), group: t("commandGroupActions") },
    ],
    [t]
  );

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <ShowcaseBlock title={t("breadcrumbTitle")}>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">{t("breadcrumbHome")}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">{t("breadcrumbDemo")}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t("breadcrumbCurrent")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </ShowcaseBlock>

      <ShowcaseBlock title={t("paginationTitle")}>
        <Pagination currentPage={page} totalPages={8} onPageChange={setPage} />
      </ShowcaseBlock>

      <ShowcaseBlock title={t("commandTitle")} hint={t("commandHint")}>
        <Button type="button" variant="outline" size="sm" onClick={() => setCommandOpen(true)}>
          <Iconify icon="lucide:command" className="size-3.5" aria-hidden />
          <Typography variant="label2" as="span">
            {t("commandOpen")}
          </Typography>
          <KbdGroup className="ms-2 hidden gap-0.5 sm:inline-flex">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </Button>
        <CommandDialog open={commandOpen} onOpenChange={setCommandOpen} items={commandItems} />
      </ShowcaseBlock>
    </>
  );
}

export function ViewFeedbackSection() {
  const t = useTranslations("demo.typography.showcase");

  return (
    <>
      <ShowcaseBlock title={t("spinnerVsSkeletonTitle")} hint={t("spinnerVsSkeletonHint")}>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col items-center justify-center gap-2 py-4">
            <Spinner className="size-6" />
            <Typography variant="caption2" as="p" color="muted">
              {t("spinnerLabel")}
            </Typography>
          </div>
          <div className="flex flex-col gap-3 py-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </ShowcaseBlock>
    </>
  );
}

type StepperPanelT = ReturnType<typeof useTranslations<"demo.typography.showcase">>;

function StepperPanelContent({ step, t }: { step: number; t: StepperPanelT }) {
  const panels = [
    {
      title: t("stepperPanel1Title"),
      body: t("stepperPanel1Body"),
      badge: t("stepperPanel1Badge"),
      items: [t("stepperPanel1Item1"), t("stepperPanel1Item2"), t("stepperPanel1Item3")],
    },
    {
      title: t("stepperPanel2Title"),
      body: t("stepperPanel2Body"),
      badge: t("stepperPanel2Badge"),
      items: [t("stepperPanel2Item1"), t("stepperPanel2Item2"), t("stepperPanel2Item3")],
    },
    {
      title: t("stepperPanel3Title"),
      body: t("stepperPanel3Body"),
      badge: t("stepperPanel3Badge"),
      items: [t("stepperPanel3Item1"), t("stepperPanel3Item2"), t("stepperPanel3Item3")],
    },
  ] as const;

  const panel = panels[step] ?? panels[0];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Typography variant="subtitle2" as="p" className="text-foreground">
          {panel.title}
        </Typography>
        <Badge variant="secondary">{panel.badge}</Badge>
      </div>
      <Typography variant="body2" as="p" color="muted" className="leading-relaxed">
        {panel.body}
      </Typography>
      <ul className="space-y-1.5 ps-4">
        {panel.items.map((item) => (
          <li key={item} className="list-disc">
            <Typography variant="caption1" as="span" color="muted">
              {item}
            </Typography>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ViewCompositesSection() {
  const t = useTranslations("demo.typography.showcase");
  const [step, setStep] = React.useState(0);

  const steps = React.useMemo(
    () => [
      { id: "1", title: t("stepperStep1"), description: t("stepperStep1Desc") },
      { id: "2", title: t("stepperStep2"), description: t("stepperStep2Desc") },
      { id: "3", title: t("stepperStep3"), description: t("stepperStep3Desc") },
    ],
    [t]
  );

  const lastStepIndex = steps.length - 1;
  const canGoBack = step > 0;
  const canGoNext = step < lastStepIndex;

  const timelineItems = React.useMemo(
    () => [
      {
        id: "1",
        title: t("timelineItem1Title"),
        description: t("timelineItem1Desc"),
        time: t("timelineItem1Time"),
        icon: "lucide:git-commit-horizontal",
      },
      {
        id: "2",
        title: t("timelineItem2Title"),
        description: t("timelineItem2Desc"),
        time: t("timelineItem2Time"),
        icon: "lucide:user-plus",
      },
      {
        id: "3",
        title: t("timelineItem3Title"),
        description: t("timelineItem3Desc"),
        time: t("timelineItem3Time"),
        icon: "lucide:rocket",
      },
    ],
    [t]
  );

  return (
    <>
      <ShowcaseBlock title={t("stepperTitle")}>
        <Stepper steps={steps} currentStep={step} onStepClick={setStep} />
        <FadeInOnChange changeKey={step} className="bg-muted/30 mt-6 rounded-lg border p-4">
          <StepperPanelContent step={step} t={t} />
        </FadeInOnChange>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <Typography variant="caption2" as="p" color="muted">
            {t("stepperProgress", { current: step + 1, total: steps.length })}
          </Typography>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!canGoBack}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              <Iconify icon="lucide:arrow-left" className="size-3.5" aria-hidden />
              {t("stepperBack")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="default"
              disabled={!canGoNext}
              onClick={() => setStep((s) => Math.min(lastStepIndex, s + 1))}
            >
              {t("stepperNext")}
              <Iconify icon="lucide:arrow-right" className="size-3.5" aria-hidden />
            </Button>
          </div>
        </div>
      </ShowcaseBlock>

      <ShowcaseBlock title={t("timelineTitle")}>
        <Timeline items={timelineItems} />
      </ShowcaseBlock>
    </>
  );
}

export function ViewTestimonialsSection() {
  const t = useTranslations("demo.typography.showcase");

  return (
    <ShowcaseBlock title={t("testimonialTitle")}>
      <div className="grid gap-4 md:grid-cols-2">
        <TestimonialCard
          quote={t("testimonialQuote")}
          authorName={t("testimonialAuthor")}
          authorRole={t("testimonialRole")}
        />
        <TestimonialCard
          quote={t("testimonialQuote2")}
          authorName={t("testimonialAuthor2")}
          authorRole={t("testimonialRole2")}
        />
      </div>
    </ShowcaseBlock>
  );
}
