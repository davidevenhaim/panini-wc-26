import type { ChecklistSource } from "@/collections/schema";

export const WC_2014_SOURCES: ChecklistSource[] = [
  {
    label: "LastSticker — Panini FIFA World Cup Brazil 2014 (Standard Edition)",
    url: "https://www.laststicker.com/cards/panini_fifa_world_cup_2014/",
    notes:
      "Designated canonical checklist for the 640-sticker Standard Edition; structured extraction of item labels, multi-part sticker configurations and base numbering mapping.",
  },
];

/**
 * Items intentionally excluded from the 640-item completion target.
 * Recognised as related releases but do not count toward album completion.
 */
export const WC_2014_EXCLUDED_ITEMS: string[] = [
  "International Update Set (71 stickers) — separate update release",
  "Coca-Cola / regional promotional inserts — varying counts by market",
];
