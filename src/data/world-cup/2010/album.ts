import type { Album } from "@/collections/schema";
import { WC_2010_SOURCES } from "./sources";
import { WC_2010_SECTIONS } from "./sections";

const ALBUM_ID = "panini-world-cup-2010";
const EXPECTED_BASE_COUNT = 640;

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
  dataStatus: "metadata-only",
  layout: "metadata-only",
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
    "Standard international edition expected to contain 640 base stickers.",
    "Awaiting verified item-level checklist before sections are populated.",
  ],
  editions: [
    {
      id: `${ALBUM_ID}::international`,
      albumId: ALBUM_ID,
      market: "INTERNATIONAL",
      editionName: { en: "International edition" },
      baseItemCount: EXPECTED_BASE_COUNT,
      isDefault: true,
      sources: WC_2010_SOURCES,
    },
  ],
};
