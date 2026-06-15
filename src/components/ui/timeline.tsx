"use client";

import * as React from "react";
import Iconify from "@/components/ui/iconify";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export type TimelineItem = {
  id: string;
  title: string;
  description?: string;
  time?: string;
  icon?: string;
};

export type TimelineProps = {
  items: TimelineItem[];
  className?: string;
};

export function Timeline({ items, className }: TimelineProps) {
  return (
    <ol data-slot="timeline" className={cn("relative space-y-0", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <li key={item.id} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast && (
              <span
                className="bg-border absolute start-4 top-8 bottom-0 w-px -translate-x-1/2"
                aria-hidden
              />
            )}
            <span className="bg-primary/10 text-primary relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full">
              <Iconify icon={item.icon ?? "lucide:circle-dot"} className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1 space-y-1 pt-0.5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <Typography variant="label2" as="p" className="text-foreground">
                  {item.title}
                </Typography>
                {item.time && (
                  <Typography variant="caption2" as="time" color="muted" className="shrink-0">
                    {item.time}
                  </Typography>
                )}
              </div>
              {item.description && (
                <Typography variant="caption1" as="p" color="muted">
                  {item.description}
                </Typography>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
