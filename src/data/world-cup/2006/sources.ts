import type { ChecklistSource } from "@/collections/schema";

export const WC_2006_SOURCES: ChecklistSource[] = [
  {
    label: "SportsCardsRock — FIFA World Cup 2006 Panini Sticker Checklist",
    url: "https://sportscardsrock.com/fifa-world-cup-2006-panini-sticker-card-checklist/",
    notes:
      "Primary source for the canonical 0-596 sticker numbering (597 entries including the #0 Calciatori stamp).",
  },
  {
    label: "Football Cartophilic Info Exchange — Panini FIFA World Cup Germany 2006 Checklist",
    url: "https://cartophilic-info-exch.blogspot.com/2016/05/panini-fifa-world-cup-germany-2006-01.html",
    notes:
      "Cross-reference for section ranges and per-team sticker counts (Netherlands 18; Angola/Ghana/Saudi Arabia 10 each).",
  },
  {
    label: "PSA / Fanatics / Football Cards Direct — graded marquee stickers",
    notes:
      "Independent verification for #185 Lionel Messi (Argentina rookie) and #298 Cristiano Ronaldo (Portugal).",
  },
];

/**
 * Items intentionally excluded from the 597-entry completion target.
 */
export const WC_2006_EXCLUDED_ITEMS: string[] = [
  "International Update Set — separate update release",
  "Coca-Cola / regional promotional inserts — varying counts by market",
];
