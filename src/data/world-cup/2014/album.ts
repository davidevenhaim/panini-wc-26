import type { Album } from "@/collections/schema";
import { WC_2014_EXCLUDED_ITEMS, WC_2014_SOURCES } from "./sources";
import { WC_2014_SECTIONS } from "./sections";

const ALBUM_ID = "panini-world-cup-2014";
const BASE_ITEM_COUNT = 640;

export const WORLD_CUP_2014_ALBUM: Album = {
  id: ALBUM_ID,
  slug: "world-cup-2014",
  familyId: "panini-world-cup",
  title: { en: "FIFA World Cup Brazil 2014", he: "מונדיאל ברזיל 2014" },
  shortTitle: { en: "WC 2014", he: "מונדיאל 2014" },
  season: "2014",
  year: 2014,
  publisher: "Panini",
  country: "GLOBAL",
  itemType: "STICKER",
  dataStatus: "verified-complete",
  totalItems: BASE_ITEM_COUNT,
  layout: "world-cup-flat-grouped",
  sections: WC_2014_SECTIONS,
  specialCollections: [],
  theme: {
    primary: "#15803d",
    secondary: "#facc15",
    accent: "#0ea5e9",
    direction: "ltr",
  },
  releasedAt: "2014",
  sources: WC_2014_SOURCES,
  sourceNotes: [
    "Reconciled standard-edition checklist sourced from a structured collector database (LastSticker).",
    "Not an official Panini checklist — community-maintained reconciliation.",
    "Excluded from the 640-item completion target:",
    ...WC_2014_EXCLUDED_ITEMS.map((line) => `  • ${line}`),
  ],
  verification: {
    status: "verified-complete",
    verifiedBy: "community-reconciliation",
    verifiedAt: "2026-06-17",
    sources: WC_2014_SOURCES,
    notes: [
      "Imported via scripts/import-laststicker.mjs from public/wc-2014.json.",
      "Reconciliation: 640 items / 640 unique codes / 34 sections / orders 1-640 with no gaps.",
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
      sources: WC_2014_SOURCES,
    },
  ],
};
