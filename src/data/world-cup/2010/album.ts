import type { Album } from "@/collections/schema";
import { WC_2010_EXCLUDED_ITEMS, WC_2010_SOURCES } from "./sources";
import { WC_2010_SECTIONS } from "./sections";

const ALBUM_ID = "panini-world-cup-2010";
const BASE_ITEM_COUNT = 641;

export const WORLD_CUP_2010_ALBUM: Album = {
  id: ALBUM_ID,
  slug: "world-cup-2010",
  familyId: "panini-world-cup",
  title: { en: "FIFA World Cup South Africa 2010", he: "מונדיאל דרום אפריקה 2010" },
  shortTitle: { en: "WC 2010", he: "מונדיאל 2010" },
  season: "2010",
  year: 2010,
  publisher: "Panini",
  country: "GLOBAL",
  itemType: "STICKER",
  dataStatus: "verified-complete",
  totalItems: BASE_ITEM_COUNT,
  layout: "world-cup-flat-grouped",
  sections: WC_2010_SECTIONS,
  specialCollections: [],
  theme: {
    primary: "#facc15",
    secondary: "#15803d",
    accent: "#0ea5e9",
    direction: "ltr",
  },
  releasedAt: "2010",
  sources: WC_2010_SOURCES,
  sourceNotes: [
    "Reconciled standard-edition checklist sourced from a structured community dump (public/wc-2010.json).",
    "Standard run advertised as 640 stickers; album content includes an additional Panini-logo cover sticker (code 000) bringing the total to 641.",
    "Excluded from the completion target:",
    ...WC_2010_EXCLUDED_ITEMS.map((line) => `  • ${line}`),
  ],
  verification: {
    status: "verified-complete",
    verifiedBy: "community-reconciliation",
    verifiedAt: "2026-06-18",
    sources: WC_2010_SOURCES,
    notes: [
      "Imported via scripts/import-laststicker.mjs from public/wc-2010.json.",
      "Reconciliation: 641 items / 641 unique codes / 34 sections / numeric codes 0-639 plus cover '000' with no gaps.",
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
      sources: WC_2010_SOURCES,
    },
  ],
};
