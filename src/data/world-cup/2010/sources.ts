import type { ChecklistSource } from "@/collections/schema";

export const WC_2010_SOURCES: ChecklistSource[] = [
  {
    label: "LastSticker — Panini FIFA World Cup South Africa 2010 (Standard Edition)",
    url: "https://www.laststicker.com/cards/panini_fifa_world_cup_2010/",
    notes:
      "Designated canonical checklist for the 640-sticker Standard Edition; structured extraction of item labels, intro pages and team sections via community dump (public/wc-2010.json).",
  },
];

/**
 * Items intentionally excluded from the 640-item completion target.
 * The album content includes a Panini-logo cover sticker (code 000)
 * commonly issued alongside the standard run.
 */
export const WC_2010_EXCLUDED_ITEMS: string[] = [
  "International Update Set — separate update release",
  "Coca-Cola / regional promotional inserts — varying counts by market",
];
