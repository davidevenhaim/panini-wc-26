import type { Album } from "@/collections/schema";
import { WC_2006_EXCLUDED_ITEMS, WC_2006_SOURCES } from "./sources";
import { WC_2006_SECTIONS } from "./sections";

const ALBUM_ID = "panini-world-cup-2006";
const BASE_ITEM_COUNT = 597;

export const WORLD_CUP_2006_ALBUM: Album = {
  id: ALBUM_ID,
  slug: "world-cup-2006",
  familyId: "panini-world-cup",
  title: { en: "FIFA World Cup Germany 2006", he: "מונדיאל גרמניה 2006" },
  shortTitle: { en: "WC 2006", he: "מונדיאל 2006" },
  season: "2006",
  year: 2006,
  publisher: "Panini",
  country: "GLOBAL",
  itemType: "STICKER",
  dataStatus: "verified-complete",
  totalItems: BASE_ITEM_COUNT,
  layout: "world-cup-flat-grouped",
  sections: WC_2006_SECTIONS,
  specialCollections: [],
  theme: {
    primary: "#0ea5e9",
    secondary: "#facc15",
    accent: "#15803d",
    direction: "ltr",
  },
  releasedAt: "2006",
  sources: WC_2006_SOURCES,
  sourceNotes: [
    "Canonical Panini checklist (597 entries: stickers 0-596, including the #0 Calciatori stamp).",
    "Marquee numbering matches collector references: #185 Lionel Messi (Argentina rookie sticker, PSA/Fanatics), #298 Cristiano Ronaldo (Portugal).",
    "Section sizes vary: most teams 19, Netherlands 18, Angola/Ghana/Saudi Arabia 10 each.",
    "Excluded from the completion target:",
    ...WC_2006_EXCLUDED_ITEMS.map((line) => `  • ${line}`),
  ],
  verification: {
    status: "verified-complete",
    verifiedBy: "community-reconciliation",
    verifiedAt: "2026-06-18",
    sources: WC_2006_SOURCES,
    notes: [
      "Generated via scripts/build-wc-2006-canonical.mjs using canonical Panini sticker numbering.",
      "Reconciliation: 597 items / 597 unique codes / 34 sections / codes 0-596 with no gaps.",
      "Supersedes the prior community dump (public/wc-2006.json) which under-counted intro stickers and over-sized Angola/Ghana/Saudi Arabia, shifting Messi to #175.",
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
      sources: WC_2006_SOURCES,
    },
  ],
};
