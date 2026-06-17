import type { Album } from "@/collections/schema";
import { WC_2010_ADRENALYN_SOURCES } from "./sources";
import { WC_2010_ADRENALYN_SECTIONS } from "./sections";

const ALBUM_ID = "panini-world-cup-2010-adrenalyn-xl";
const EXPECTED_BASE_COUNT = 350;

export const WORLD_CUP_2010_ADRENALYN_ALBUM: Album = {
  id: ALBUM_ID,
  slug: "world-cup-2010-adrenalyn-xl",
  familyId: "world-cup-adrenalyn-xl",
  title: {
    en: "FIFA World Cup 2010 Adrenalyn XL",
    he: "מונדיאל 2010 Adrenalyn XL",
  },
  shortTitle: { en: "WC 2010 XL", he: "מונדיאל 2010 XL" },
  season: "2010",
  year: 2010,
  publisher: "Panini",
  country: "GLOBAL",
  itemType: "CARD",
  dataStatus: "metadata-only",
  layout: "metadata-only",
  sections: WC_2010_ADRENALYN_SECTIONS,
  specialCollections: [],
  theme: {
    primary: "#0ea5e9",
    secondary: "#0f172a",
    accent: "#facc15",
    direction: "ltr",
  },
  releasedAt: "2010",
  sources: WC_2010_ADRENALYN_SOURCES,
  sourceNotes: [
    "Standard Adrenalyn XL set expected to contain 350 base cards.",
    "Limited Editions, regional alternatives and Road to World Cup cards are excluded from the base set.",
    "Awaiting verified item-level checklist via scripts/import-laststicker.mjs.",
  ],
  editions: [
    {
      id: `${ALBUM_ID}::international`,
      albumId: ALBUM_ID,
      market: "INTERNATIONAL",
      editionName: { en: "International edition" },
      baseItemCount: EXPECTED_BASE_COUNT,
      isDefault: true,
      sources: WC_2010_ADRENALYN_SOURCES,
    },
  ],
};
