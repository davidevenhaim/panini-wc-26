import type { Album } from "@/collections/schema";
import { WC_2018_EXCLUDED_ITEMS, WC_2018_SOURCES } from "./sources";
import { WC_2018_SECTIONS } from "./sections";

const ALBUM_ID = "panini-world-cup-2018";
const BASE_ITEM_COUNT = 682;

export const WORLD_CUP_2018_ALBUM: Album = {
  id: ALBUM_ID,
  slug: "world-cup-2018",
  familyId: "panini-world-cup",
  title: { en: "FIFA World Cup Russia 2018", he: "מונדיאל רוסיה 2018" },
  shortTitle: { en: "WC 2018", he: "מונדיאל 2018" },
  season: "2018",
  year: 2018,
  publisher: "Panini",
  country: "GLOBAL",
  itemType: "STICKER",
  dataStatus: "verified-complete",
  totalItems: BASE_ITEM_COUNT,
  layout: "world-cup-flat-grouped",
  sections: WC_2018_SECTIONS,
  specialCollections: [],
  theme: {
    primary: "#dc2626",
    secondary: "#1e3a8a",
    accent: "#facc15",
    direction: "ltr",
  },
  releasedAt: "2018",
  sources: WC_2018_SOURCES,
  sourceNotes: [
    "Reconciled standard-edition checklist sourced from a community dump (cross-referenced with LastSticker).",
    "Not an official Panini checklist — community-maintained reconciliation.",
    "Excluded from the 682-item completion target:",
    ...WC_2018_EXCLUDED_ITEMS.map((line) => `  • ${line}`),
  ],
  verification: {
    status: "verified-complete",
    verifiedBy: "community-reconciliation",
    verifiedAt: "2026-06-17",
    sources: WC_2018_SOURCES,
    notes: [
      "Imported via scripts/import-laststicker.mjs (flat-sticker adapter) from public/wc-2018.json.",
      "Reconciliation: 682 items / 682 unique codes / 35 sections / codes 0–681 contiguous with no gaps.",
    ],
  },
  editions: [
    {
      id: `${ALBUM_ID}::international`,
      albumId: ALBUM_ID,
      market: "INTERNATIONAL",
      editionName: { en: "Standard Edition" },
      baseItemCount: BASE_ITEM_COUNT,
      isDefault: true,
      sources: WC_2018_SOURCES,
    },
  ],
};
