"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/iconify";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export type StepperStep = {
  id: string;
  title: string;
  description?: string;
};

export type StepperProps = {
  steps: StepperStep[];
  /** Zero-based index of the active step. */
  currentStep: number;
  className?: string;
  /** When set, step indicators are clickable. */
  onStepClick?: (index: number) => void;
};

const INDICATOR_SIZE = "size-8";

function indicatorClass(isComplete: boolean, isCurrent: boolean) {
  return cn(
    INDICATOR_SIZE,
    "flex shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors",
    "ring-4 ring-background",
    "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
    isComplete && "bg-primary text-primary-foreground",
    isCurrent && "bg-primary text-primary-foreground",
    !isComplete && !isCurrent && "border border-border/80 bg-muted/40 text-muted-foreground"
  );
}

function StepIndicator({
  index,
  isComplete,
  isCurrent,
  canClick,
  onStepClick,
}: {
  index: number;
  isComplete: boolean;
  isCurrent: boolean;
  canClick: boolean;
  onStepClick?: (index: number) => void;
}) {
  const content = isComplete ? (
    <Iconify icon="lucide:check" className="size-3.5" aria-hidden />
  ) : (
    index + 1
  );

  if (canClick) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="none"
        onClick={() => onStepClick?.(index)}
        className={indicatorClass(isComplete, isCurrent)}
        aria-current={isCurrent ? "step" : undefined}
      >
        {content}
      </Button>
    );
  }

  return (
    <span
      className={indicatorClass(isComplete, isCurrent)}
      aria-current={isCurrent ? "step" : undefined}
    >
      {content}
    </span>
  );
}

function StepConnector({
  active,
  orientation,
}: {
  active: boolean;
  orientation: "horizontal" | "vertical";
}) {
  if (orientation === "vertical") {
    return (
      <span className={cn("bg-border h-6 w-px shrink-0", active && "bg-primary")} aria-hidden />
    );
  }

  return (
    <span className={cn("bg-border h-px w-full min-w-6", active && "bg-primary")} aria-hidden />
  );
}

function StepColumn({
  step,
  index,
  isComplete,
  isCurrent,
  isUpcoming,
  canClick,
  onStepClick,
}: {
  step: StepperStep;
  index: number;
  isComplete: boolean;
  isCurrent: boolean;
  isUpcoming: boolean;
  canClick: boolean;
  onStepClick?: (index: number) => void;
}) {
  return (
    <li className="flex min-w-0 flex-col items-center md:max-w-[10rem] md:shrink-0">
      <div className={cn("flex items-center justify-center", INDICATOR_SIZE)}>
        <StepIndicator
          index={index}
          isComplete={isComplete}
          isCurrent={isCurrent}
          canClick={canClick}
          onStepClick={onStepClick}
        />
      </div>
      <div className="mt-2.5 w-full space-y-0.5 px-2 text-center">
        <Typography
          variant="label2"
          as="p"
          className={cn(
            "text-sm leading-tight font-medium",
            !isUpcoming && "text-foreground",
            isUpcoming && "text-muted-foreground"
          )}
        >
          {step.title}
        </Typography>
        {step.description && (
          <Typography variant="caption2" as="p" color="muted" className="text-xs leading-snug">
            {step.description}
          </Typography>
        )}
      </div>
    </li>
  );
}

export function Stepper({ steps, currentStep, className, onStepClick }: StepperProps) {
  const safeStep = Math.min(Math.max(currentStep, 0), Math.max(steps.length - 1, 0));
  const canClick = Boolean(onStepClick);

  return (
    <nav aria-label="Progress" className={cn("w-full", className)}>
      {/* Mobile: vertical */}
      <ol className="flex list-none flex-col items-center p-0 md:hidden">
        {steps.map((step, index) => {
          const isComplete = index < safeStep;
          const isCurrent = index === safeStep;
          const isUpcoming = index > safeStep;
          const segmentActive = index > 0 && index <= safeStep;

          return (
            <React.Fragment key={step.id}>
              {index > 0 && (
                <li className="flex list-none justify-center py-0.5" aria-hidden>
                  <StepConnector active={segmentActive} orientation="vertical" />
                </li>
              )}
              <StepColumn
                step={step}
                index={index}
                isComplete={isComplete}
                isCurrent={isCurrent}
                isUpcoming={isUpcoming}
                canClick={canClick}
                onStepClick={onStepClick}
              />
            </React.Fragment>
          );
        })}
      </ol>

      {/* Desktop: horizontal — connector rows share h-8 with circles so lines stay centered */}
      <ol className="hidden w-full list-none items-start p-0 md:flex">
        {steps.flatMap((step, index) => {
          const isComplete = index < safeStep;
          const isCurrent = index === safeStep;
          const isUpcoming = index > safeStep;
          const segmentActive = index > 0 && index <= safeStep;
          const nodes: React.ReactNode[] = [];

          if (index > 0) {
            nodes.push(
              <li
                key={`${step.id}-connector`}
                className={cn("flex min-w-8 flex-1 items-center self-start", INDICATOR_SIZE)}
                aria-hidden
              >
                <StepConnector active={segmentActive} orientation="horizontal" />
              </li>
            );
          }

          nodes.push(
            <StepColumn
              key={step.id}
              step={step}
              index={index}
              isComplete={isComplete}
              isCurrent={isCurrent}
              isUpcoming={isUpcoming}
              canClick={canClick}
              onStepClick={onStepClick}
            />
          );

          return nodes;
        })}
      </ol>
    </nav>
  );
}
