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
  dataStatus: "verified-partial",
  totalItems: BASE_ITEM_COUNT,
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
    "Verified-partial — 630-card structure built from the official Panini PDF; team identities only confirmed for 9 anchor blocks (Algeria, Argentina, Australia, Austria, Belgium, Brazil, USA, Uruguay, Uzbekistan).",
    "The remaining 33 national-team blocks (positions 7–39) render as 'Team Block N' placeholders until a full PDF parse is supplied — use Report-a-mistake to flag corrections.",
    "Excluded from the 630-card base-binder completion target:",
    ...WC_2026_ADRENALYN_EXTRAS_NOTES.map((line) => `  • ${line}`),
  ],
  verification: {
    status: "verified-partial",
    verifiedBy: "community-reconciliation",
    verifiedAt: "2026-06-17",
    sources: WC_2026_ADRENALYN_SOURCES,
    notes: [
      "Numbering: complete (1..630, contiguous, no gaps).",
      "Identification: partial (categories + ranges verified; 33 team blocks pending PDF parse for team names).",
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
