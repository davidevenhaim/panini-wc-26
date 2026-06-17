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
import { AreYouSureDialog } from "@/components/ui/are-you-sure-dialog";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/iconify";
import { useBoolean } from "@/hooks/use-boolean";
import { toastSuccess } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { useCollectionStore } from "@/store/collection.store";
import type { AlbumSection } from "@/collections/schema";
import { StickerCounter } from "../sticker-counter";
import { ReportButton } from "@/features/data-reports/report-button";
import { useItemTerminology } from "../use-item-terminology";
import type { FilterMode } from "../types";

type Props = {
  section: AlbumSection | null;
  albumId?: string;
  albumTitle?: string;
  /** Album item type — drives sticker vs card terminology. */
  itemType?: "STICKER" | "CARD" | "MIXED";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filter: FilterMode;
  query: string;
  rtl?: boolean;
};

function matchesFilter(qty: number, filter: FilterMode): boolean {
  if (filter === "all") return true;
  if (filter === "missing") return qty === 0;
  if (filter === "owned") return qty >= 1;
  if (filter === "duplicates") return qty >= 2;
  return true;
}

export function GenericSectionDialog({
  section,
  albumId,
  albumTitle,
  itemType,
  open,
  onOpenChange,
  filter,
  query,
  rtl,
}: Props) {
  const t = useTranslations();
  const term = useItemTerminology({ itemType: itemType ?? "STICKER" });
  const confirmClear = useBoolean();
  const quantities = useCollectionStore((s) => s.quantities);
  const increment = useCollectionStore((s) => s.increment);
  const decrement = useCollectionStore((s) => s.decrement);
  const toggle = useCollectionStore((s) => s.toggle);
  const markSectionComplete = useCollectionStore((s) => s.markSectionComplete);

  if (!section) return null;

  const primary = section.primaryColor ?? "#0f172a";
  const accent = section.accentColor ?? primary;
  const titleEn = section.title.en ?? "";
  const titleHe = section.title.he ?? titleEn;
  const title = rtl ? titleHe : titleEn || titleHe;

  const owned = section.items.reduce(
    (acc, item) => acc + (((quantities[item.code] ?? 0) as number) >= 1 ? 1 : 0),
    0
  );
  const total = section.items.length;
  const percent = total === 0 ? 0 : Math.round((owned / total) * 100);
  const isComplete = owned === total && total > 0;

  const lcQuery = query.trim().toLowerCase();
  const visibleItems = section.items.filter((item) => {
    const qty = (quantities[item.code] ?? 0) as number;
    if (!matchesFilter(qty, filter)) return false;
    if (!lcQuery) return true;
    if (item.code.toLowerCase().includes(lcQuery)) return true;
    const player = item.playerName?.en?.toLowerCase() ?? item.playerName?.he?.toLowerCase() ?? "";
    return player.includes(lcQuery);
  });

  function clearSection() {
    for (const item of section!.items) {
      if ((quantities[item.code] ?? 0) > 0) {
        useCollectionStore.getState().setQuantity(item.code, 0);
      }
    }
    toastSuccess(t("album.team.clear"));
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[92svh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <div
            className="relative px-5 pt-5 pb-4"
            style={{ background: `linear-gradient(135deg, ${primary}30 0%, ${accent}18 100%)` }}
          >
            <DialogHeader>
              <div className="flex items-center gap-3 pe-8">
                {section.flag ? (
                  <span
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-4xl shadow-sm ring-2 ring-white/40"
                    style={{ backgroundColor: primary }}
                    aria-hidden
                  >
                    {section.flag}
                  </span>
                ) : (
                  <span
                    className="font-heading flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl font-black text-white shadow-sm ring-2 ring-white/40"
                    style={{ backgroundColor: primary }}
                    aria-hidden
                  >
                    {section.badge ?? title.charAt(0).toUpperCase()}
                  </span>
                )}
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
                  <DialogDescription className="mt-1 flex items-center gap-2 font-mono text-xs">
                    <span className="font-semibold">
                      {owned}/{total}
                    </span>
                    <span className="text-foreground/30">•</span>
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
                  background: isComplete
                    ? "#10b981"
                    : `linear-gradient(90deg, ${primary}, ${accent})`,
                }}
              />
            </div>
          </div>

          <div className="bg-background/40 min-h-0 flex-1 overflow-y-auto p-4">
            {visibleItems.length === 0 ? (
              <p className="text-foreground/60 py-8 text-center text-sm">
                {t("album.search.noMatches")}
              </p>
            ) : (
              <div className={cn("grid gap-2", "grid-cols-2 sm:grid-cols-3 md:grid-cols-4")}>
                {visibleItems.map((item) => (
                  <StickerCounter
                    key={item.code}
                    code={item.code}
                    quantity={(quantities[item.code] ?? 0) as number}
                    ownedColor={primary}
                    onIncrement={() => increment(item.code)}
                    onDecrement={() => decrement(item.code)}
                    onToggle={() => toggle(item.code)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="bg-background flex flex-wrap items-center justify-end gap-2 border-t p-3 sm:p-4">
            {albumId && (
              <ReportButton
                variant="ghost"
                size="sm"
                className="me-auto"
                context={{
                  albumId,
                  albumTitle,
                  sectionId: section.id,
                  sectionTitle: title,
                  itemType,
                }}
              />
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => confirmClear.onTrue()}
              className="gap-1"
            >
              <Iconify icon="lucide:trash-2" className="size-4" />
              {t("album.team.clear")}
            </Button>
            <Button
              size="sm"
              onClick={() => {
                markSectionComplete({
                  stickers: section.items.map((it) => ({
                    id: it.id,
                    code: it.code,
                    number: it.order,
                    category: "TEAM",
                  })),
                });
                toastSuccess(t("album.team.complete"));
              }}
              disabled={isComplete}
              className="gap-1"
            >
              <Iconify icon="lucide:check-check" className="size-4" />
              {term.markSectionComplete}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AreYouSureDialog
        open={confirmClear.value}
        onOpenChange={confirmClear.onToggle}
        onConfirm={clearSection}
        title={t("album.team.clearConfirmTitle")}
        description={t("album.team.clearConfirmDescription")}
        variant="destructive"
      />
    </>
  );
}
