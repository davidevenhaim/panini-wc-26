"use client";

import Iconify from "@/components/ui/iconify";
import { Typography } from "@/components/ui/typography";
import type { AlbumGroupedBucket } from "@/lib/album/album-progress";

type Props = {
  buckets: AlbumGroupedBucket[];
  variant: "missing" | "duplicates";
  emptyMessage: string;
};

export function AlbumGroupedCodeBuckets({ buckets, variant, emptyMessage }: Props) {
  if (buckets.length === 0) {
    return (
      <div className="bg-card rounded-3xl border-2 border-dashed p-8 text-center">
        <Iconify
          icon={variant === "missing" ? "lucide:party-popper" : "lucide:sparkles"}
          className="text-foreground/30 mx-auto size-10"
        />
        <Typography variant="body2" as="p" color="muted" className="mt-2">
          {emptyMessage}
        </Typography>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-3xl border p-4 shadow-sm">
      <ul className="space-y-3">
        {buckets.map((bucket) => (
          <li key={bucket.id} className="bg-muted/40 rounded-2xl p-3">
            <Typography
              variant="label2"
              as="span"
              className="text-foreground/80 block text-xs font-bold"
            >
              {bucket.title}{" "}
              <span className="text-foreground/50 font-mono font-normal">
                · {bucket.codes.length}
              </span>
            </Typography>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {bucket.codes.map((code) => {
                if (variant === "missing") {
                  return (
                    <span
                      key={code}
                      className="bg-background/80 rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold"
                      dir="ltr"
                    >
                      {code}
                    </span>
                  );
                }

                const dup = bucket.counts?.[code] ?? 0;
                return (
                  <span
                    key={code}
                    className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-amber-900 dark:bg-amber-900/30 dark:text-amber-200"
                    dir="ltr"
                  >
                    {code}
                    <span className="rounded-full bg-amber-500 px-1.5 text-[10px] text-white">
                      +{dup}
                    </span>
                  </span>
                );
              })}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
