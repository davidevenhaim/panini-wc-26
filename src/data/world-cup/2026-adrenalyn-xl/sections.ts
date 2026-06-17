import type {
  AlbumSection,
  CollectibleItem,
  LocalizedText,
  SpecialCollection,
} from "@/collections/schema";
import { ADRENALYN_RANGES } from "./categories";
import { ADRENALYN_TEAM_ROSTER } from "./team-roster";

const ALBUM_ID = "panini-world-cup-2026-adrenalyn-xl";

/* ── Item helpers ──────────────────────────────────────────────────────── */

type ItemExtras = {
  category: string;
  name: LocalizedText;
  playerName?: LocalizedText;
  teamName?: LocalizedText;
};

function item(code: number, sectionId: string, extras: ItemExtras): CollectibleItem {
  const codeStr = String(code);
  const it: CollectibleItem = {
    id: `${ALBUM_ID}:${codeStr}`,
    albumId: ALBUM_ID,
    sectionId,
    code: codeStr,
    displayNumber: codeStr,
    order: code,
    isRequiredForCompletion: true,
    availability: "PACK",
    category: extras.category,
    name: extras.name,
  };
  if (extras.playerName) it.playerName = extras.playerName;
  if (extras.teamName) it.teamName = extras.teamName;
  return it;
}

function localized(en: string, he?: string): LocalizedText {
  return he ? { en, he } : { en };
}

/* ── Golden Ballers (1–9) — verified player names ──────────────────────── */

const GOLDEN_BALLER_NAMES: { en: string; he: string }[] = [
  { en: "Lionel Messi", he: "ליאו מסי" },
  { en: "Vinícius Júnior", he: "ויניסיוס ז'וניור" },
  { en: "Mohamed Salah", he: "מוחמד סלאח" },
  { en: "Harry Kane", he: "הארי קיין" },
  { en: "Kylian Mbappé", he: "קיליאן אמבפה" },
  { en: "Son Heung-min", he: "סון הונג-מין" },
  { en: "Erling Haaland", he: "ארלינג הולאנד" },
  { en: "Cristiano Ronaldo", he: "כריסטיאנו רונאלדו" },
  { en: "Lamine Yamal", he: "לאמין יאמאל" },
];

const goldenBallers: AlbumSection = {
  id: "golden-ballers",
  title: { en: "Golden Ballers", he: "כדורי הזהב" },
  subtitle: { en: "Chase cards 1–9", he: "קלפי רדיפה 1–9" },
  order: 1,
  entityType: "SPECIAL",
  badge: "GB",
  primaryColor: "#facc15",
  accentColor: "#f59e0b",
  items: GOLDEN_BALLER_NAMES.map((p, i) => {
    const code = ADRENALYN_RANGES.goldenBallers.start + i;
    return item(code, "golden-ballers", {
      category: "GOLDEN_BALLER",
      name: localized(p.en, p.he),
      playerName: localized(p.en, p.he),
    });
  }),
};

/* ── National-team blocks (10–513) — alphabetical, 42 × 12 ─────────────── */

function teamSectionFor(blockIndex: number): AlbumSection {
  const seed = ADRENALYN_TEAM_ROSTER[blockIndex];
  const start = ADRENALYN_RANGES.nationalTeams.start + blockIndex * 12;
  const sectionId = seed.nameEn
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const teamName: LocalizedText = { en: seed.nameEn, he: seed.nameHe };

  const items: CollectibleItem[] = [
    item(start, sectionId, {
      category: "FAN_FAVOURITE",
      name: localized(
        `Card ${start} — ${seed.nameEn} Fan Favourite`,
        `קלף ${start} — האהוב על אוהדי ${seed.nameHe}`
      ),
      teamName,
    }),
    // Crests are NEVER tagged with a playerName, per spec.
    item(start + 1, sectionId, {
      category: "TEAM_CREST",
      name: localized(`${seed.nameEn} Team Crest`, `סמל נבחרת ${seed.nameHe}`),
      teamName,
    }),
    item(start + 2, sectionId, {
      category: "ICON",
      name: localized(
        `Card ${start + 2} — ${seed.nameEn} Icon`,
        `קלף ${start + 2} — אייקון ${seed.nameHe}`
      ),
      teamName,
    }),
    ...Array.from({ length: 9 }, (_, i) => {
      const code = start + 3 + i;
      return item(code, sectionId, {
        category: "HERO",
        name: localized(`Card ${code} — ${seed.nameEn}`, `קלף ${code} — ${seed.nameHe}`),
        teamName,
      });
    }),
  ];

  return {
    id: sectionId,
    title: { en: seed.nameEn, he: seed.nameHe },
    order: 2 + blockIndex,
    entityType: "NATIONAL_TEAM",
    badge: seed.code,
    flag: seed.flag,
    group: seed.tournamentGroup,
    primaryColor: seed.primary,
    accentColor: seed.accent,
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
    return item(code, "contenders", {
      category: "CONTENDER",
      name: localized(`Card ${code} — Contender`, `קלף ${code} — מתמודד`),
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
      return item(code, id, {
        category,
        name: localized(`Card ${code} — ${itemNameEn}`, `קלף ${code} — ${itemNameHe}`),
      });
    }),
  };
}

const baseCategoryOrder = 2 + 42 + 1;

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
  baseCategoryOrder,
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
  baseCategoryOrder + 1,
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
  baseCategoryOrder + 2,
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
  baseCategoryOrder + 3,
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
  baseCategoryOrder + 4,
  "Master Rookie",
  "טירון מובחר"
);

const officialEmblem: AlbumSection = {
  id: "official-emblem",
  title: { en: "Official Emblem", he: "סמל רשמי" },
  subtitle: { en: "Card 624", he: "קלף 624" },
  order: baseCategoryOrder + 5,
  entityType: "SPECIAL",
  badge: "OE",
  primaryColor: "#facc15",
  accentColor: "#10b981",
  items: [
    item(ADRENALYN_RANGES.officialEmblem.start, "official-emblem", {
      category: "OFFICIAL_EMBLEM",
      name: localized("Card 624 — Official Emblem", "קלף 624 — סמל רשמי"),
    }),
  ],
};

const officialMascots: AlbumSection = {
  id: "official-mascots",
  title: { en: "Official Mascots", he: "קמיעות רשמיות" },
  subtitle: { en: "Cards 625–627", he: "קלפים 625–627" },
  order: baseCategoryOrder + 6,
  entityType: "SPECIAL",
  badge: "OM",
  primaryColor: "#06b6d4",
  accentColor: "#0e7490",
  items: Array.from({ length: 3 }, (_, i) => {
    const code = ADRENALYN_RANGES.officialMascots.start + i;
    return item(code, "official-mascots", {
      category: "OFFICIAL_MASCOT",
      name: localized(`Card ${code} — Official Mascot`, `קלף ${code} — קמיע רשמי`),
    });
  }),
};

const eternos22: AlbumSection = {
  id: "eternos-22",
  title: { en: "Eternos 22", he: "Eternos 22" },
  subtitle: { en: "Cards 628–630", he: "קלפים 628–630" },
  order: baseCategoryOrder + 7,
  entityType: "SPECIAL",
  badge: "ET",
  primaryColor: "#7c3aed",
  accentColor: "#1e1b4b",
  items: Array.from({ length: 3 }, (_, i) => {
    const code = ADRENALYN_RANGES.eternos22.start + i;
    return item(code, "eternos-22", {
      category: "ETERNOS_22",
      name: localized(`Card ${code} — Eternos 22`, `קלף ${code} — Eternos 22`),
    });
  }),
};

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

/* ── Extras — never counted toward 630 ─────────────────────────────────── */

const momentum: SpecialCollection = {
  id: "momentum",
  title: { en: "Momentum", he: "מומנטום" },
  description: {
    en: "Three Momentum cards distributed separately from the base binder.",
    he: "שלושה קלפי מומנטום המופצים בנפרד מאלבום הבסיס.",
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
      name: { en: "Jude Bellingham — Momentum", he: "ג'וד בלינגהאם — מומנטום" },
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
      name: { en: "Ousmane Dembélé — Momentum", he: "אוסמן דמבלה — מומנטום" },
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
      name: { en: "Christian Pulisic — Momentum", he: "כריסטיאן פוליסיץ' — מומנטום" },
      playerName: { en: "Christian Pulisic" },
      teamName: { en: "United States" },
      category: "MOMENTUM",
    },
  ],
};

// Empty placeholder Limited Edition family — tracking wired but no items
// imported until a verified checklist is supplied.
const limitedEditions: SpecialCollection = {
  id: "limited-editions",
  title: { en: "Limited Editions", he: "מהדורות מוגבלות" },
  description: {
    en: "Limited Edition checklist pending — no items imported yet.",
    he: "רשימת המהדורות המוגבלות ממתינה — טרם נטענו פריטים.",
  },
  countsTowardAlbumCompletion: false,
  primaryColor: "#facc15",
  accentColor: "#854d0e",
  icon: "lucide:gem",
  items: [],
};

export const WC_2026_ADRENALYN_SPECIALS: SpecialCollection[] = [momentum, limitedEditions];
