// Adrenalyn XL card categorisation. Stored on each item via
// CollectibleItem.category (free-form string field on the schema), the
// values below are the canonical labels used by the renderer + tests.

export const ADRENALYN_CATEGORIES = [
  "GOLDEN_BALLER",
  "FAN_FAVOURITE",
  "TEAM_CREST",
  "ICON",
  "PLAYER",
  "CONTENDER",
  "TOP_KEEPER",
  "DEFENSIVE_ROCK",
  "MIDFIELD_MAESTRO",
  "GOAL_MACHINE",
  "MASTER_ROOKIE",
  "OFFICIAL_EMBLEM",
  "OFFICIAL_MASCOT",
  "ETERNOS_22",
  "MOMENTUM",
] as const;

export type AdrenalynCardCategory = (typeof ADRENALYN_CATEGORIES)[number];

export type CardSetScope = "BASE_BINDER" | "EXTRA";

/**
 * Official base-binder ranges (1-based, inclusive). Reconciles to 630 in
 * the validator: 9 + 504 + 36 + 9 + 9 + 18 + 22 + 16 + 1 + 3 + 3 = 630.
 */
export const ADRENALYN_RANGES = {
  goldenBallers: { start: 1, end: 9 },
  nationalTeams: { start: 10, end: 513 },
  contenders: { start: 514, end: 549 },
  topKeepers: { start: 550, end: 558 },
  defensiveRocks: { start: 559, end: 567 },
  midfieldMaestros: { start: 568, end: 585 },
  goalMachines: { start: 586, end: 607 },
  masterRookies: { start: 608, end: 623 },
  officialEmblem: { start: 624, end: 624 },
  officialMascots: { start: 625, end: 627 },
  eternos22: { start: 628, end: 630 },
} as const;
