import type { Album } from "@/collections/schema";
import { WC_2022_EXCLUDED_ITEMS, WC_2022_SOURCES } from "./sources";
import { WC_2022_SECTIONS } from "./sections";

const ALBUM_ID = "panini-world-cup-2022";
const BASE_ITEM_COUNT = 670;

export const WORLD_CUP_2022_ALBUM: Album = {
  id: ALBUM_ID,
  slug: "world-cup-2022",
  familyId: "panini-world-cup",
  title: { en: "FIFA World Cup Qatar 2022", he: "מונדיאל קטאר 2022" },
  shortTitle: { en: "WC 2022", he: "מונדיאל 2022" },
  season: "2022",
  year: 2022,
  publisher: "Panini",
  country: "GLOBAL",
  itemType: "STICKER",
  dataStatus: "verified-complete",
  totalItems: BASE_ITEM_COUNT,
  layout: "world-cup-flat-grouped",
  sections: WC_2022_SECTIONS,
  specialCollections: [],
  theme: {
    primary: "#7c1d3f",
    secondary: "#0f766e",
    accent: "#facc15",
    direction: "ltr",
  },
  releasedAt: "2022",
  sources: WC_2022_SOURCES,
  sourceNotes: [
    "Reconciled standard-edition checklist sourced from a structured collector database (LastSticker cross-checked against The Cardboard Connection, eBay singles listing and Cartophilic Info Exchange).",
    "Not an official Panini checklist — community-maintained reconciliation.",
    "Excluded from the 670-item completion target:",
    ...WC_2022_EXCLUDED_ITEMS.map((line) => `  • ${line}`),
  ],
  verification: {
    status: "verified-complete",
    verifiedBy: "community-reconciliation",
    verifiedAt: "2026-06-17",
    sources: WC_2022_SOURCES,
    notes: [
      "Imported via scripts/import-laststicker.mjs from public/wc-2022.json (independently validated bundle).",
      "Reconciliation: 670 items / 670 unique codes / 36 sections / orders 1-670 with no gaps.",
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
      sources: WC_2022_SOURCES,
    },
  ],
};
