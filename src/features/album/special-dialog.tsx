"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/iconify";
import { toastSuccess } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { SpecialSection } from "@/types/album.types";
import { getQuantity } from "@/lib/album/collection";
import { useCollectionStore } from "@/store/collection.store";
import { StickerCounter } from "./sticker-counter";
import type { FilterMode } from "./types";

type Props = {
  section: SpecialSection | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accentColor: string;
  icon: string;
  imageSrc?: string;
  filter: FilterMode;
  query: string;
};

function matchesFilter(qty: number, filter: FilterMode): boolean {
  if (filter === "all") return true;
  if (filter === "missing") return qty === 0;
  if (filter === "owned") return qty >= 1;
  if (filter === "duplicates") return qty >= 2;
  return true;
}

export function SpecialDialog({
  section,
  open,
  onOpenChange,
  accentColor,
  icon,
  imageSrc,
  filter,
  query,
}: Props) {
  const t = useTranslations();
  const quantities = useCollectionStore((s) => s.quantities);
  const increment = useCollectionStore((s) => s.increment);
  const decrement = useCollectionStore((s) => s.decrement);
  const toggle = useCollectionStore((s) => s.toggle);
  const markSectionComplete = useCollectionStore((s) => s.markSectionComplete);

  if (!section) return null;

  const owned = section.stickers.reduce(
    (acc, s) => acc + (getQuantity(quantities, s.code) >= 1 ? 1 : 0),
    0
  );
  const total = section.stickers.length;
  const percent = total === 0 ? 0 : Math.round((owned / total) * 100);
  const isComplete = owned === total && total > 0;

  const lcQuery = query.trim().toLowerCase();
  const visible = section.stickers.filter((s) => {
    const qty = getQuantity(quantities, s.code);
    if (!matchesFilter(qty, filter)) return false;
    if (!lcQuery) return true;
    return s.code.toLowerCase().includes(lcQuery);
  });

  const title = t(`album.sections.${section.i18nKey}`);
  const description = t(`album.sections.${section.i18nKey}Description`);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92svh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <div
          className="relative px-5 pt-5 pb-4"
          style={{
            background: `linear-gradient(135deg, ${accentColor}30 0%, ${accentColor}12 100%)`,
          }}
        >
          <DialogHeader>
            <div className="flex items-center gap-3 pe-8">
              <span
                className={cn(
                  "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-2 ring-white/40",
                  imageSrc ? "overflow-hidden bg-white" : "text-white"
                )}
                style={imageSrc ? undefined : { backgroundColor: accentColor }}
                aria-hidden
              >
                {imageSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageSrc}
                    alt=""
                    className="h-full w-full object-contain p-1.5"
                    draggable={false}
                  />
                ) : (
                  <Iconify icon={icon} className="size-7" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <DialogTitle className="flex items-center gap-2 text-base font-extrabold sm:text-lg">
                  <span className="truncate">{title}</span>
                  {isComplete && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                      <Iconify icon="lucide:check" className="size-3" />
                      {t("album.team.completedBadge")}
                    </span>
                  )}
                </DialogTitle>
                <DialogDescription className="mt-1 text-xs">
                  {description}
                  <span className="text-foreground/30 mx-2">•</span>
                  <span className="font-mono font-semibold">
                    {owned}/{total}
                  </span>
                  <span className="text-foreground/30 mx-2">•</span>
                  <span>{percent}%</span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="bg-foreground/15 mt-3 h-1.5 w-full overflow-hidden rounded-full">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${percent}%`,
                background: isComplete ? "#10b981" : accentColor,
              }}
            />
          </div>
        </div>

        <div className="bg-background/40 min-h-0 flex-1 overflow-y-auto p-4">
          {visible.length === 0 ? (
            <p className="text-foreground/60 py-8 text-center text-sm">
              {t("album.search.noMatches")}
            </p>
          ) : (
            <div className={cn("grid gap-2", "grid-cols-2 sm:grid-cols-3 md:grid-cols-4")}>
              {visible.map((sticker) => (
                <StickerCounter
                  key={sticker.code}
                  code={sticker.code}
                  quantity={getQuantity(quantities, sticker.code)}
                  ownedColor={accentColor}
                  onIncrement={() => increment(sticker.code)}
                  onDecrement={() => decrement(sticker.code)}
                  onToggle={() => toggle(sticker.code)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="bg-background flex justify-end border-t p-3 sm:p-4">
          <Button
            size="sm"
            onClick={() => {
              markSectionComplete(section);
              toastSuccess(t("album.special.completeSuccess"));
            }}
            disabled={isComplete}
            className="gap-1"
          >
            <Iconify icon="lucide:check-check" className="size-4" />
            {t("album.special.complete")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
