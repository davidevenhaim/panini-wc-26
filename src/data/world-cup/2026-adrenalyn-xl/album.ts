import type { Album } from "@/collections/schema";
import { WC_2026_ADRENALYN_EXTRAS_NOTES, WC_2026_ADRENALYN_SOURCES } from "./sources";
import { WC_2026_ADRENALYN_SECTIONS, WC_2026_ADRENALYN_SPECIALS } from "./sections";

const ALBUM_ID = "panini-world-cup-2026-adrenalyn-xl";
const BASE_ITEM_COUNT = 630;

export const WORLD_CUP_2026_ADRENALYN_ALBUM: Album = {
  id: ALBUM_ID,
  slug: "world-cup-2026-adrenalyn-xl",
  familyId: "world-cup-adrenalyn-xl",
  title: { en: "FIFA World Cup 2026 Adrenalyn XL", he: "מונדיאל 2026 Adrenalyn XL" },
  shortTitle: { en: "WC 2026 XL", he: "מונדיאל 2026 XL" },
  season: "2026",
  year: 2026,
  publisher: "Panini",
  country: "GLOBAL",
  itemType: "CARD",
  dataStatus: "verified-complete",
  totalItems: BASE_ITEM_COUNT,
  binderCapacity: 720,
  completionScope: "BASE_BINDER",
  layout: "adrenalyn-sections",
  sections: WC_2026_ADRENALYN_SECTIONS,
  specialCollections: WC_2026_ADRENALYN_SPECIALS,
  theme: {
    primary: "#0ea5e9",
    secondary: "#facc15",
    accent: "#7c3aed",
    direction: "ltr",
  },
  releasedAt: "2026",
  sources: WC_2026_ADRENALYN_SOURCES,
  sourceNotes: [
    "Verified-complete — 630-card structure, 42 team identities, category ranges and tournament-group mapping reconciled against the official Panini WC 2026 Adrenalyn XL checklist (PDF).",
    "Per-card player names for the team blocks, Contenders and special categories use systematic placeholders (`Card N — Team`). They are tracking-ready; replacing them with verified player rows is non-destructive (stable IDs, stable codes, stable quantities).",
    "Physical binder capacity is 720 pockets — that is not the completion target. Base-binder completion is exactly 630 cards.",
    "Excluded from the 630-card base-binder completion target (tracked separately under Extras):",
    ...WC_2026_ADRENALYN_EXTRAS_NOTES.map((line) => `  • ${line}`),
  ],
  verification: {
    status: "verified-complete",
    verifiedBy: "community-reconciliation",
    verifiedAt: "2026-06-17",
    sources: WC_2026_ADRENALYN_SOURCES,
    notes: [
      "Numbering: complete (1..630, contiguous, no gaps, no duplicates).",
      "Structure: 9 Golden Ballers + 42 × 12 team blocks (FF/CREST/IC/9×HERO) + 36 Contenders + 8 special categories — reconciles to 630 exactly.",
      "Identification: team blocks + tournament-group mapping verified against the WC26 draw. Per-card player names use stable placeholders pending an optional PDF row import; this does not affect completion tracking.",
      "Binder capacity 720 is physical metadata only and does not influence the completion percentage.",
    ],
  },
  editions: [
    {
      id: `${ALBUM_ID}::international`,
      albumId: ALBUM_ID,
      market: "INTERNATIONAL",
      editionName: { en: "Base Binder" },
      baseItemCount: BASE_ITEM_COUNT,
      isDefault: true,
      sources: WC_2026_ADRENALYN_SOURCES,
    },
  ],
};
