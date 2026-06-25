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
import type { Team } from "@/types/album.types";
import { getQuantity } from "@/lib/album/collection";
import { useCollectionStore } from "@/store/collection.store";
import { StickerCounter } from "./sticker-counter";
import type { FilterMode } from "./types";
import {
  DialogSideNavDesktop,
  DialogSideNavMobile,
  preventDialogCloseOnSideNav,
  useDialogSectionNav,
} from "./dialog-side-nav";

type Props = {
  team: Team | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filter: FilterMode;
  query: string;
  teams?: Team[];
  onTeamChange?: (teamCode: string) => void;
};

function matchesFilter(qty: number, filter: FilterMode): boolean {
  if (filter === "all") return true;
  if (filter === "missing") return qty === 0;
  if (filter === "owned") return qty >= 1;
  if (filter === "duplicates") return qty >= 2;
  return true;
}

export function TeamDialog({
  team,
  open,
  onOpenChange,
  filter,
  query,
  teams,
  onTeamChange,
}: Props) {
  const t = useTranslations();
  const confirmClear = useBoolean();
  const quantities = useCollectionStore((s) => s.quantities);
  const increment = useCollectionStore((s) => s.increment);
  const decrement = useCollectionStore((s) => s.decrement);
  const toggle = useCollectionStore((s) => s.toggle);
  const markComplete = useCollectionStore((s) => s.markTeamComplete);
  const clearTeam = useCollectionStore((s) => s.clearTeam);

  const navigableTeams = teams ?? (team ? [team] : []);
  const currentIndex = team ? navigableTeams.findIndex((t) => t.code === team.code) : -1;
  const nav = useDialogSectionNav({
    open,
    items: navigableTeams,
    currentIndex,
    onSelect: onTeamChange ? (nextTeam) => onTeamChange(nextTeam.code) : undefined,
  });

  if (!team) return null;

  const owned = team.stickers.reduce(
    (acc, s) => acc + (getQuantity(quantities, s.code) >= 1 ? 1 : 0),
    0
  );
  const total = team.stickers.length;
  const isComplete = owned === total;
  const percent = Math.round((owned / total) * 100);

  const lcQuery = query.trim().toLowerCase();
  const teamMatchesQuery =
    !lcQuery ||
    team.code.toLowerCase().includes(lcQuery) ||
    team.name.toLowerCase().includes(lcQuery);

  const visibleStickers = team.stickers.filter((s) => {
    const qty = getQuantity(quantities, s.code);
    if (!matchesFilter(qty, filter)) return false;
    if (!lcQuery) return true;
    if (teamMatchesQuery) return true;
    return s.code.toLowerCase().includes(lcQuery);
  });

  const sideNav = (
    <DialogSideNavDesktop
      enabled={open && nav.canNavigate}
      hasPrev={nav.hasPrev}
      hasNext={nav.hasNext}
      goPrev={nav.goPrev}
      goNext={nav.goNext}
      prevLabel={t("album.team.previousSection")}
      nextLabel={t("album.team.nextSection")}
    />
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="flex max-h-[92svh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
          portalSibling={sideNav}
          onPointerDownOutside={preventDialogCloseOnSideNav}
          onInteractOutside={preventDialogCloseOnSideNav}
        >
          <div
            className="relative px-5 pt-5 pb-4"
            style={{
              background: `linear-gradient(135deg, ${team.primaryColor}30 0%, ${team.accentColor}18 100%)`,
            }}
          >
            <DialogHeader>
              <div className="flex items-center gap-2 pe-8">
                <DialogSideNavMobile
                  enabled={open && nav.canNavigate}
                  hasPrev={nav.hasPrev}
                  hasNext={nav.hasNext}
                  goPrev={nav.goPrev}
                  goNext={nav.goNext}
                  prevLabel={t("album.team.previousSection")}
                  nextLabel={t("album.team.nextSection")}
                />
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span
                    className="ring-border/30 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-4xl shadow-sm ring-2"
                    aria-hidden
                  >
                    <span className="drop-shadow-sm">{team.flag}</span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <DialogTitle className="flex items-center gap-2 text-base font-extrabold sm:text-lg">
                      <span className="truncate">{team.name}</span>
                      <span
                        className="rounded-full px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-white uppercase"
                        style={{ backgroundColor: team.primaryColor }}
                      >
                        {team.code}
                      </span>
                      {isComplete && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                          <Iconify icon="lucide:check" className="size-3" />
                          {t("album.team.completedBadge")}
                        </span>
                      )}
                    </DialogTitle>
                    <DialogDescription className="mt-1 flex items-center gap-2 font-mono text-xs">
                      <span>{t("album.team.groupLabel", { group: team.group })}</span>
                      <span className="text-foreground/30">•</span>
                      <span className="font-semibold">
                        {t("album.team.progress", { owned, total })}
                      </span>
                      <span className="text-foreground/30">•</span>
                      <span>{percent}%</span>
                    </DialogDescription>
                  </div>
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
                    : `linear-gradient(90deg, ${team.primaryColor}, ${team.accentColor})`,
                }}
              />
            </div>
          </div>

          <div className="bg-background/40 min-h-0 flex-1 overflow-y-auto p-4">
            {visibleStickers.length === 0 ? (
              <p className="text-foreground/60 py-8 text-center text-sm">
                {t("album.search.noMatches")}
              </p>
            ) : (
              <div className={cn("grid gap-2", "grid-cols-2 sm:grid-cols-3 md:grid-cols-4")}>
                {visibleStickers.map((sticker) => (
                  <StickerCounter
                    key={sticker.code}
                    code={sticker.code}
                    quantity={getQuantity(quantities, sticker.code)}
                    ownedColor={team.primaryColor}
                    onIncrement={() => increment(sticker.code)}
                    onDecrement={() => decrement(sticker.code)}
                    onToggle={() => toggle(sticker.code)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="bg-background flex flex-col gap-2 border-t p-3 sm:p-4">
            <div className="flex flex-wrap justify-end gap-2">
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
                  markComplete(team);
                  toastSuccess(t("album.team.complete"));
                }}
                disabled={isComplete}
                className="gap-1"
              >
                <Iconify icon="lucide:check-check" className="size-4" />
                {t("album.team.complete")}
              </Button>
            </div>
            <Button className="w-full sm:hidden" onClick={() => onOpenChange(false)}>
              {t("confirm")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AreYouSureDialog
        open={confirmClear.value}
        onOpenChange={confirmClear.onToggle}
        onConfirm={() => {
          clearTeam(team);
          toastSuccess(t("album.team.clear"));
        }}
        title={t("album.team.clearConfirmTitle")}
        description={t("album.team.clearConfirmDescription")}
        variant="destructive"
      />
    </>
  );
}
