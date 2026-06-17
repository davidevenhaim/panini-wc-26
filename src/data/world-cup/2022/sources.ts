import type { ChecklistSource } from "@/collections/schema";

// Sources copied from the reconciled LastSticker bundle. The dataset is a
// reconciled standard-edition checklist sourced from a structured collector
// database, not an official Panini checklist.
export const WC_2022_SOURCES: ChecklistSource[] = [
  {
    label: "LastSticker — Panini FIFA World Cup Qatar 2022 (Standard Edition)",
    url: "https://www.laststicker.com/cards/panini_fifa_world_cup_2022/",
    notes:
      "Designated canonical checklist for the 670-sticker Standard Edition; codes follow its scheme (Team Photo = #1, Team Logo Foil = #2, players #3-20).",
  },
  {
    label: "The Cardboard Connection — 2022 Panini World Cup Stickers Qatar Checklist",
    url: "https://www.cardboardconnection.com/2022-panini-world-cup-stickers-qatar-cards",
    notes:
      "Full published Standard-Edition checklist used to enumerate every code, player and section.",
  },
  {
    label: "eBay singles listing 334547940622 (Group A & B foils + team singles)",
    url: "https://www.ebay.de/itm/334547940622",
    notes:
      "Independent confirmation of opener (FWC1-18), FIFA Museum (FWC19+) and per-team 1-20 layout.",
  },
  {
    label: "Football Cartophilic Info Exchange — Panini FIFA World Cup Qatar 2022 checklist",
    url: "https://cartophilic-info-exch.blogspot.com/2022/08/panini-fifa-world-cup-qatar-2022-04_0903152903.html",
    notes:
      "Confirms 670 = Oryx/Standard album size and documents an alternate 638-sticker regional scheme that was deliberately NOT used.",
  },
];

/**
 * Items intentionally excluded from the 670-item completion target.
 * These are still recognised as related releases but do not count toward
 * album completion.
 */
export const WC_2022_EXCLUDED_ITEMS: string[] = [
  "Base Update Set (79 stickers) — separate update release",
  "Coca-Cola Team Believers Brazil insert (8 stickers, C1-C8) — promotional",
  "DFB Germany online bundle insert (27 stickers, DFB1-DFB27) — regional/online exclusive",
  "Extra Stickers — Legends & Rookies (20 stickers, 1:190) — special insert, no standard album space",
  "US/Online border parallels (Gold/Blue/Red/Purple/Green/Black) — parallel variants",
];
