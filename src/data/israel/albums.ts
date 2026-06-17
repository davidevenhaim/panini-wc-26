import type { Album } from "@/collections/schema";

/**
 * Israeli league sticker albums — legacy Supergol era and the current Football
 * Stars series.
 *
 * IMPORTANT (per project rules):
 *   - All entries here are stored as `metadata-only` because we have not
 *     independently verified the historical checklists.
 *   - We DO NOT invent sticker codes, players, teams or section structure.
 *   - Each entry's `sourceNotes` flags that the album's existence is based on
 *     general public knowledge of Israeli football sticker publishing; the
 *     checklist itself is awaiting community contribution.
 */

const SOURCE_NOTE_GENERIC =
  "Album existence based on public knowledge of Israeli football sticker publishing. Checklist not yet verified — awaiting community contribution.";

type SeasonSeed = {
  /** Season label, e.g. "1998/99" */
  season: string;
  /** Ending calendar year (used for sorting). */
  year: number;
};

const LEGACY_SUPERGOL_SEASONS: SeasonSeed[] = [
  { season: "1998/99", year: 1999 },
  { season: "1999/00", year: 2000 },
  { season: "2000/01", year: 2001 },
  { season: "2001/02", year: 2002 },
  { season: "2002/03", year: 2003 },
  { season: "2003/04", year: 2004 },
  { season: "2004/05", year: 2005 },
  { season: "2005/06", year: 2006 },
  { season: "2006/07", year: 2007 },
  { season: "2007/08", year: 2008 },
  { season: "2008/09", year: 2009 },
  { season: "2009/10", year: 2010 },
  { season: "2010/11", year: 2011 },
  { season: "2011/12", year: 2012 },
  { season: "2012/13", year: 2013 },
  { season: "2013/14", year: 2014 },
  { season: "2014/15", year: 2015 },
  { season: "2015/16", year: 2016 },
  { season: "2016/17", year: 2017 },
  { season: "2017/18", year: 2018 },
  { season: "2018/19", year: 2019 },
];

const FOOTBALL_STARS_SEASONS: SeasonSeed[] = [
  { season: "2020/21", year: 2021 },
  { season: "2021/22", year: 2022 },
  { season: "2022/23", year: 2023 },
  { season: "2023/24", year: 2024 },
  { season: "2024/25", year: 2025 },
  { season: "2025/26", year: 2026 },
];

function slugFromSeason(prefix: string, season: string): string {
  return `${prefix}-${season.replace("/", "-")}`;
}

function buildLegacySupergol({ season, year }: SeasonSeed): Album {
  const slug = slugFromSeason("supergol", season);
  return {
    id: `supergol-${season}`,
    slug,
    familyId: "israeli-football-albums",
    title: {
      en: `Supergol ${season}`,
      he: `סופרגול ${season}`,
    },
    shortTitle: { en: `Supergol ${season}`, he: `סופרגול ${season}` },
    season,
    year,
    country: "ISRAEL",
    itemType: "STICKER",
    dataStatus: "metadata-only",
    layout: "metadata-only",
    sections: [],
    specialCollections: [],
    theme: {
      primary: "#0038b8",
      secondary: "#dc2626",
      accent: "#facc15",
      direction: "rtl",
    },
    sourceNotes: [
      SOURCE_NOTE_GENERIC,
      "Legacy Supergol era — pre-rebrand. Published in Israel; exact publisher across seasons may vary.",
    ],
  };
}

function buildFootballStars({ season, year }: SeasonSeed): Album {
  const slug = slugFromSeason("football-stars", season);
  return {
    id: `football-stars-${season}`,
    slug,
    familyId: "israeli-football-albums",
    title: {
      en: `Football Stars ${season}`,
      he: `הכוכבים של הכדורגל ${season}`,
    },
    shortTitle: { en: `Football Stars ${season}`, he: `כוכבי הכדורגל ${season}` },
    season,
    year,
    publisher: "Panini (Israel)",
    country: "ISRAEL",
    itemType: "STICKER",
    dataStatus: "metadata-only",
    layout: "metadata-only",
    sections: [],
    specialCollections: [],
    theme: {
      primary: "#0038b8",
      secondary: "#dc2626",
      accent: "#facc15",
      direction: "rtl",
    },
    sourceNotes: [SOURCE_NOTE_GENERIC, "Modern Football Stars era — Israeli Premier League."],
  };
}

export const SUPERGOL_LEGACY_ALBUMS: Album[] = LEGACY_SUPERGOL_SEASONS.map(buildLegacySupergol);
export const FOOTBALL_STARS_ALBUMS: Album[] = FOOTBALL_STARS_SEASONS.map(buildFootballStars);

export const ISRAEL_ALBUMS: Album[] = [...FOOTBALL_STARS_ALBUMS, ...SUPERGOL_LEGACY_ALBUMS];
