"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type AiMessageSkeletonProps = {
  lines?: number;
  className?: string;
};

export function AiMessageSkeleton({ lines = 3, className }: AiMessageSkeletonProps) {
  const widths = ["w-full", "w-[92%]", "w-[78%]", "w-[65%]", "w-[88%]"];

  return (
    <div
      data-slot="ai-message-skeleton"
      className={cn("bg-muted/20 space-y-2.5 rounded-xl border p-4", className)}
      aria-busy="true"
      aria-live="polite"
    >
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-3.5 animate-pulse",
            widths[i % widths.length],
            "from-muted via-muted/50 to-muted bg-gradient-to-r bg-[length:200%_100%] [animation-duration:1.4s]"
          )}
        />
      ))}
    </div>
  );
}
