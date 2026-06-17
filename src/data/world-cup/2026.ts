import type { Album, AlbumSection, CollectibleItem, SpecialCollection } from "@/collections/schema";
import {
  BONUS_SECTION,
  FWC_CLOSING_SECTION,
  FWC_OPENING_SECTION,
  PANINI_LOGO_SECTION,
  TEAMS,
} from "@/constants/album";

const ALBUM_ID = "panini-world-cup-2026";

function itemsForTeam(team: (typeof TEAMS)[number]): CollectibleItem[] {
  return team.stickers.map((s, i) => ({
    id: `${ALBUM_ID}:${s.code}`,
    albumId: ALBUM_ID,
    sectionId: team.code,
    code: s.code,
    displayNumber: String(s.number),
    order: i,
    isRequiredForCompletion: true,
    availability: "PACK",
    teamName: { en: team.name },
  }));
}

const teamSections: AlbumSection[] = TEAMS.map((team, idx) => ({
  id: team.code,
  title: { en: team.name },
  subtitle: { en: `Group ${team.group}` },
  order: idx + 2, // after panini logo + opening FWC
  entityType: "NATIONAL_TEAM",
  badge: team.code,
  group: team.group,
  flag: team.flag,
  primaryColor: team.primaryColor,
  accentColor: team.accentColor,
  items: itemsForTeam(team),
}));

function buildSpecialSection(
  section: typeof FWC_OPENING_SECTION,
  meta: {
    order: number;
    entityType: AlbumSection["entityType"];
    title: { en: string; he?: string };
    subtitle?: { en: string; he?: string };
    badge?: string;
    primaryColor?: string;
    accentColor?: string;
  }
): AlbumSection {
  return {
    id: section.id,
    title: meta.title,
    subtitle: meta.subtitle,
    order: meta.order,
    entityType: meta.entityType,
    badge: meta.badge,
    primaryColor: meta.primaryColor,
    accentColor: meta.accentColor,
    items: section.stickers.map((s, i) => ({
      id: `${ALBUM_ID}:${s.code}`,
      albumId: ALBUM_ID,
      sectionId: section.id,
      code: s.code,
      displayNumber: String(s.number),
      order: i,
      isRequiredForCompletion: true,
      availability: "PACK",
    })),
  };
}

const introSections: AlbumSection[] = [
  buildSpecialSection(PANINI_LOGO_SECTION, {
    order: 0,
    entityType: "INTRO",
    title: { en: "Panini badge", he: "סמל פאניני" },
    badge: "LOGO",
    primaryColor: "#facc15",
  }),
  buildSpecialSection(FWC_OPENING_SECTION, {
    order: 1,
    entityType: "TOURNAMENT",
    title: { en: "World Cup intro (FWC 1–8)", he: "פתיחת המונדיאל" },
    badge: "FWC",
    primaryColor: "#0f172a",
  }),
];

const closingSection: AlbumSection = buildSpecialSection(FWC_CLOSING_SECTION, {
  order: 999,
  entityType: "TOURNAMENT",
  title: { en: "Closing FWC (9–19)", he: "סיום FWC" },
  badge: "FWC",
  primaryColor: "#0ea5e9",
});

const bonus: SpecialCollection = {
  id: BONUS_SECTION.id,
  title: { en: "Coca-Cola bonus", he: "אוסף בונוס קוקה קולה" },
  description: {
    en: "12 bonus stickers — do not count toward the 980 album.",
    he: "12 מדבקות בונוס — לא נספרות ב-980.",
  },
  countsTowardAlbumCompletion: false,
  primaryColor: "#dc2626",
  items: BONUS_SECTION.stickers.map((s, i) => ({
    id: `${ALBUM_ID}:${s.code}`,
    albumId: ALBUM_ID,
    sectionId: BONUS_SECTION.id,
    code: s.code,
    displayNumber: String(s.number),
    order: i,
    isRequiredForCompletion: false,
    availability: "PROMO",
  })),
};

export const WORLD_CUP_2026_ALBUM: Album = {
  id: ALBUM_ID,
  slug: "world-cup-2026",
  familyId: "panini-world-cup",
  title: {
    en: "FIFA World Cup 2026",
    he: 'מונדיאל פיפ"א 2026',
  },
  shortTitle: { en: "WC 2026", he: "מונדיאל 2026" },
  season: "2026",
  year: 2026,
  publisher: "Panini",
  country: "GLOBAL",
  itemType: "STICKER",
  dataStatus: "verified-complete",
  totalItems: 980,
  layout: "world-cup-grouped",
  sections: [...introSections, ...teamSections, closingSection],
  specialCollections: [bonus],
  theme: {
    primary: "#10b981",
    secondary: "#0ea5e9",
    accent: "#facc15",
    direction: "ltr",
  },
  coverAsset: "/fwc.jpg",
  releasedAt: "2026",
  sourceNotes: [
    "48-team list and Panini album order supplied by the project owner.",
    "Stickers per team and FWC range counts match the published 980-sticker layout.",
  ],
  sources: [
    {
      label: "Project owner — supplied team order, FWC structure and per-team sticker counts",
      accessedAt: "2026-06-15",
    },
  ],
  verification: {
    status: "verified-complete",
    verifiedBy: "project-owner",
    verifiedAt: "2026-06-15",
    sources: [
      {
        label: "Project owner — supplied team order, FWC structure and per-team sticker counts",
        accessedAt: "2026-06-15",
      },
    ],
  },
};
