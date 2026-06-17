import type { ChecklistSource } from "@/collections/schema";

export const WC_2018_SOURCES: ChecklistSource[] = [
  {
    label: "Panini FIFA World Cup Russia 2018 — community checklist dump",
    url: "https://www.laststicker.com/cards/panini_fifa_world_cup_2018/",
    notes:
      "Flat 682-sticker checklist dump (codes 0–681) used as the canonical source for this album. Cross-referenced against the LastSticker page above.",
  },
];

/**
 * Items intentionally excluded from the 682-item completion target.
 * Recognised as related releases but do not count toward album completion.
 */
export const WC_2018_EXCLUDED_ITEMS: string[] = [
  "International Update Set (92 transfer stickers) — separate post-print release",
  "Coca-Cola / regional promotional inserts (M1–M9 / C1–C9 / others) — varying counts by market",
];
