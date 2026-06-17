import type { AlbumSection, CollectibleItem, SpecialCollection } from "@/collections/schema";
import { ADRENALYN_RANGES } from "./categories";

const ALBUM_ID = "panini-world-cup-2026-adrenalyn-xl";

/* ── Confirmed team blocks from the official PDF ───────────────────────── */

type TeamSeed = {
  code: string;
  nameEn: string;
  nameHe: string;
  flag: string;
  primary: string;
  accent: string;
  /** Block index 0..41 (override only when known). */
  blockIndex: number;
};

/**
 * Anchor teams confirmed against the official checklist. The full
 * 42-team list is alphabetical, but only the 9 anchor blocks are named
 * here — the other 33 blocks render as generic "Team Block N" tiles
 * until the PDF is parsed in full.
 */
const CONFIRMED_TEAMS: TeamSeed[] = [
  {
    blockIndex: 0,
    code: "ALG",
    nameEn: "Algeria",
    nameHe: "אלג'יריה",
    flag: "🇩🇿",
    primary: "#006233",
    accent: "#FFFFFF",
  },
  {
    blockIndex: 1,
    code: "ARG",
    nameEn: "Argentina",
    nameHe: "ארגנטינה",
    flag: "🇦🇷",
    primary: "#75AADB",
    accent: "#FFFFFF",
  },
  {
    blockIndex: 2,
    code: "AUS",
    nameEn: "Australia",
    nameHe: "אוסטרליה",
    flag: "🇦🇺",
    primary: "#00843D",
    accent: "#FFCD00",
  },
  {
    blockIndex: 3,
    code: "AUT",
    nameEn: "Austria",
    nameHe: "אוסטריה",
    flag: "🇦🇹",
    primary: "#ED2939",
    accent: "#FFFFFF",
  },
  {
    blockIndex: 4,
    code: "BEL",
    nameEn: "Belgium",
    nameHe: "בלגיה",
    flag: "🇧🇪",
    primary: "#000000",
    accent: "#FFD90C",
  },
  {
    blockIndex: 5,
    code: "BRA",
    nameEn: "Brazil",
    nameHe: "ברזיל",
    flag: "🇧🇷",
    primary: "#FEDF00",
    accent: "#009C3B",
  },
  {
    blockIndex: 39,
    code: "USA",
    nameEn: "United States",
    nameHe: "ארה״ב",
    flag: "🇺🇸",
    primary: "#3C3B6E",
    accent: "#B22234",
  },
  {
    blockIndex: 40,
    code: "URU",
    nameEn: "Uruguay",
    nameHe: "אורוגוואי",
    flag: "🇺🇾",
    primary: "#7B9BD4",
    accent: "#FFFFFF",
  },
  {
    blockIndex: 41,
    code: "UZB",
    nameEn: "Uzbekistan",
    nameHe: "אוזבקיסטן",
    flag: "🇺🇿",
    primary: "#1EB53A",
    accent: "#0099B5",
  },
];

const CONFIRMED_BY_INDEX = new Map(CONFIRMED_TEAMS.map((t) => [t.blockIndex, t]));

/* ── Card-level builders ───────────────────────────────────────────────── */

function item(
  code: number,
  sectionId: string,
  category: string,
  name: { en: string; he?: string }
): CollectibleItem {
  const codeStr = String(code);
  return {
    id: `${ALBUM_ID}:${codeStr}`,
    albumId: ALBUM_ID,
    sectionId,
    code: codeStr,
    displayNumber: codeStr,
    order: code,
    name,
    category,
    isRequiredForCompletion: true,
    availability: "PACK",
  };
}

/* ── Golden Ballers (1–9) ──────────────────────────────────────────────── */

const goldenBallers: AlbumSection = {
  id: "golden-ballers",
  title: { en: "Golden Ballers", he: "כדורי הזהב" },
  subtitle: { en: "Chase cards 1–9", he: "קלפי רדיפה 1–9" },
  order: 1,
  entityType: "SPECIAL",
  badge: "GB",
  primaryColor: "#facc15",
  accentColor: "#f59e0b",
  items: Array.from({ length: 9 }, (_, i) => {
    const code = ADRENALYN_RANGES.goldenBallers.start + i;
    return item(code, "golden-ballers", "GOLDEN_BALLER", {
      en: `Card ${code} — Golden Baller`,
      he: `קלף ${code} — כדור הזהב`,
    });
  }),
};

/* ── National-team blocks (10–513) ─────────────────────────────────────── */

function teamSectionFor(blockIndex: number): AlbumSection {
  const blockStart = ADRENALYN_RANGES.nationalTeams.start + blockIndex * 12; // 10, 22, 34, ...
  const confirmed = CONFIRMED_BY_INDEX.get(blockIndex);
  const sectionId = confirmed
    ? `team-${confirmed.nameEn.toLowerCase().replace(/\s+/g, "-")}`
    : `team-block-${String(blockIndex + 1).padStart(2, "0")}`;
  const titleEn = confirmed ? confirmed.nameEn : `Team Block ${blockIndex + 1}`;
  const titleHe = confirmed?.nameHe;
  const code = confirmed?.code ?? `T${String(blockIndex + 1).padStart(2, "0")}`;
  const flag = confirmed?.flag;
  const primary = confirmed?.primary ?? "#0ea5e9";
  const accent = confirmed?.accent ?? "#0f172a";

  const teamName = confirmed ? { en: confirmed.nameEn, he: confirmed.nameHe } : { en: titleEn };

  const items: CollectibleItem[] = [
    {
      ...item(blockStart, sectionId, "FAN_FAVOURITE", {
        en: `Card ${blockStart} — ${titleEn} Fan Favourite`,
        he: titleHe ? `קלף ${blockStart} — האהוב על האוהדים ${titleHe}` : undefined,
      }),
      teamName,
    },
    {
      ...item(blockStart + 1, sectionId, "TEAM_CREST", {
        en: `Card ${blockStart + 1} — ${titleEn} Crest`,
        he: titleHe ? `קלף ${blockStart + 1} — סמל ${titleHe}` : undefined,
      }),
      teamName,
    },
    {
      ...item(blockStart + 2, sectionId, "ICON", {
        en: `Card ${blockStart + 2} — ${titleEn} Icon`,
        he: titleHe ? `קלף ${blockStart + 2} — אייקון ${titleHe}` : undefined,
      }),
      teamName,
    },
    ...Array.from({ length: 9 }, (_, i) => ({
      ...item(blockStart + 3 + i, sectionId, "PLAYER", {
        en: `Card ${blockStart + 3 + i} — ${titleEn}`,
        he: titleHe ? `קלף ${blockStart + 3 + i} — ${titleHe}` : undefined,
      }),
      teamName,
    })),
  ];

  return {
    id: sectionId,
    title: { en: titleEn, he: titleHe },
    order: 2 + blockIndex,
    entityType: "NATIONAL_TEAM",
    badge: code,
    ...(flag ? { flag } : {}),
    primaryColor: primary,
    accentColor: accent,
    items,
  };
}

const teamSections: AlbumSection[] = Array.from({ length: 42 }, (_, i) => teamSectionFor(i));

/* ── Contenders (514–549) ──────────────────────────────────────────────── */

const contenders: AlbumSection = {
  id: "contenders",
  title: { en: "Contenders", he: "המתמודדים" },
  subtitle: { en: "Cards 514–549", he: "קלפים 514–549" },
  order: 2 + 42,
  entityType: "SPECIAL",
  badge: "CT",
  primaryColor: "#0ea5e9",
  accentColor: "#1e3a8a",
  items: Array.from({ length: 36 }, (_, i) => {
    const code = ADRENALYN_RANGES.contenders.start + i;
    return item(code, "contenders", "CONTENDER", {
      en: `Card ${code} — Contender`,
      he: `קלף ${code} — מתמודד`,
    });
  }),
};

/* ── Special categories (550–630) ──────────────────────────────────────── */

function specialSection(
  id: string,
  titleEn: string,
  titleHe: string,
  badge: string,
  primary: string,
  accent: string,
  category: string,
  start: number,
  end: number,
  order: number,
  itemNameEn: string,
  itemNameHe: string
): AlbumSection {
  return {
    id,
    title: { en: titleEn, he: titleHe },
    subtitle: { en: `Cards ${start}–${end}`, he: `קלפים ${start}–${end}` },
    order,
    entityType: "PLAYER_CATEGORY",
    badge,
    primaryColor: primary,
    accentColor: accent,
    items: Array.from({ length: end - start + 1 }, (_, i) => {
      const code = start + i;
      return item(code, id, category, {
        en: `Card ${code} — ${itemNameEn}`,
        he: `קלף ${code} — ${itemNameHe}`,
      });
    }),
  };
}

const baseOrderForCategories = 2 + 42 + 1; // after contenders

const topKeepers = specialSection(
  "top-keepers",
  "Top Keepers",
  "השוערים המובילים",
  "TK",
  "#22c55e",
  "#15803d",
  "TOP_KEEPER",
  ADRENALYN_RANGES.topKeepers.start,
  ADRENALYN_RANGES.topKeepers.end,
  baseOrderForCategories,
  "Top Keeper",
  "שוער מוביל"
);

const defensiveRocks = specialSection(
  "defensive-rocks",
  "Defensive Rocks",
  "סלעי ההגנה",
  "DR",
  "#64748b",
  "#1e293b",
  "DEFENSIVE_ROCK",
  ADRENALYN_RANGES.defensiveRocks.start,
  ADRENALYN_RANGES.defensiveRocks.end,
  baseOrderForCategories + 1,
  "Defensive Rock",
  "סלע הגנה"
);

const midfieldMaestros = specialSection(
  "midfield-maestros",
  "Midfield Maestros",
  "מאסטרו אמצע השדה",
  "MM",
  "#a855f7",
  "#6b21a8",
  "MIDFIELD_MAESTRO",
  ADRENALYN_RANGES.midfieldMaestros.start,
  ADRENALYN_RANGES.midfieldMaestros.end,
  baseOrderForCategories + 2,
  "Midfield Maestro",
  "מאסטרו אמצע השדה"
);

const goalMachines = specialSection(
  "goal-machines",
  "Goal Machines",
  "מכונות גולים",
  "GM",
  "#ef4444",
  "#7f1d1d",
  "GOAL_MACHINE",
  ADRENALYN_RANGES.goalMachines.start,
  ADRENALYN_RANGES.goalMachines.end,
  baseOrderForCategories + 3,
  "Goal Machine",
  "מכונת גולים"
);

const masterRookies = specialSection(
  "master-rookies",
  "Master Rookies",
  "טירונים מובחרים",
  "MR",
  "#f97316",
  "#9a3412",
  "MASTER_ROOKIE",
  ADRENALYN_RANGES.masterRookies.start,
  ADRENALYN_RANGES.masterRookies.end,
  baseOrderForCategories + 4,
  "Master Rookie",
  "טירון מובחר"
);

const officialEmblem: AlbumSection = {
  id: "official-emblem",
  title: { en: "Official Emblem", he: "סמל רשמי" },
  subtitle: { en: "Card 624", he: "קלף 624" },
  order: baseOrderForCategories + 5,
  entityType: "SPECIAL",
  badge: "OE",
  primaryColor: "#facc15",
  accentColor: "#10b981",
  items: [
    item(ADRENALYN_RANGES.officialEmblem.start, "official-emblem", "OFFICIAL_EMBLEM", {
      en: "Card 624 — Official Emblem",
      he: "קלף 624 — סמל רשמי",
    }),
  ],
};

const officialMascots: AlbumSection = {
  id: "official-mascots",
  title: { en: "Official Mascots", he: "קמיעות רשמיות" },
  subtitle: { en: "Cards 625–627", he: "קלפים 625–627" },
  order: baseOrderForCategories + 6,
  entityType: "SPECIAL",
  badge: "OM",
  primaryColor: "#06b6d4",
  accentColor: "#0e7490",
  items: Array.from({ length: 3 }, (_, i) => {
    const code = ADRENALYN_RANGES.officialMascots.start + i;
    return item(code, "official-mascots", "OFFICIAL_MASCOT", {
      en: `Card ${code} — Official Mascot`,
      he: `קלף ${code} — קמיע רשמי`,
    });
  }),
};

const eternos22: AlbumSection = {
  id: "eternos-22",
  title: { en: "Eternos 22", he: "Eternos 22" },
  subtitle: { en: "Cards 628–630", he: "קלפים 628–630" },
  order: baseOrderForCategories + 7,
  entityType: "SPECIAL",
  badge: "ET",
  primaryColor: "#7c3aed",
  accentColor: "#1e1b4b",
  items: Array.from({ length: 3 }, (_, i) => {
    const code = ADRENALYN_RANGES.eternos22.start + i;
    return item(code, "eternos-22", "ETERNOS_22", {
      en: `Card ${code} — Eternos 22`,
      he: `קלף ${code} — Eternos 22`,
    });
  }),
};

/* ── Final assembly ────────────────────────────────────────────────────── */

export const WC_2026_ADRENALYN_SECTIONS: AlbumSection[] = [
  goldenBallers,
  ...teamSections,
  contenders,
  topKeepers,
  defensiveRocks,
  midfieldMaestros,
  goalMachines,
  masterRookies,
  officialEmblem,
  officialMascots,
  eternos22,
];

/* ── Extras (Momentum cards) — not counted toward 630 ──────────────────── */

const momentum: SpecialCollection = {
  id: "momentum",
  title: { en: "Momentum", he: "מומנטום" },
  description: {
    en: "Three Momentum cards distributed separately from the base binder.",
    he: "שלושה קלפי מומנטום המופצים בנפרד מהאלבום הראשי.",
  },
  countsTowardAlbumCompletion: false,
  primaryColor: "#f43f5e",
  accentColor: "#fb7185",
  icon: "lucide:flame",
  items: [
    {
      id: `${ALBUM_ID}::momentum:bellingham`,
      albumId: ALBUM_ID,
      sectionId: "momentum",
      code: "MOM-BELLINGHAM",
      displayNumber: "MOM-1",
      order: 1,
      isRequiredForCompletion: false,
      availability: "PROMO",
      name: { en: "Jude Bellingham — Momentum" },
      playerName: { en: "Jude Bellingham" },
      teamName: { en: "England" },
      category: "MOMENTUM",
    },
    {
      id: `${ALBUM_ID}::momentum:dembele`,
      albumId: ALBUM_ID,
      sectionId: "momentum",
      code: "MOM-DEMBELE",
      displayNumber: "MOM-2",
      order: 2,
      isRequiredForCompletion: false,
      availability: "PROMO",
      name: { en: "Ousmane Dembélé — Momentum" },
      playerName: { en: "Ousmane Dembélé" },
      teamName: { en: "France" },
      category: "MOMENTUM",
    },
    {
      id: `${ALBUM_ID}::momentum:pulisic`,
      albumId: ALBUM_ID,
      sectionId: "momentum",
      code: "MOM-PULISIC",
      displayNumber: "MOM-3",
      order: 3,
      isRequiredForCompletion: false,
      availability: "PROMO",
      name: { en: "Christian Pulisic — Momentum" },
      playerName: { en: "Christian Pulisic" },
      teamName: { en: "United States" },
      category: "MOMENTUM",
    },
  ],
};

export const WC_2026_ADRENALYN_SPECIALS: SpecialCollection[] = [momentum];
