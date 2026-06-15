import type { Sticker, Team } from "@/types/album.types";

type TeamSeed = Omit<Team, "albumOrder" | "stickers"> & { albumOrder?: number };

const STICKERS_PER_TEAM = 20;

/**
 * Album order per the WC 2026 group draw (Groups A → L, in order within group).
 * Total: 48 teams × 20 stickers = 960.
 *
 * Colors are approximate brand/flag values — they are not lifted from any
 * official Panini artwork. Tweak in this file if you want a different vibe.
 */
const TEAM_SEEDS: TeamSeed[] = [
  // Group A
  {
    code: "MEX",
    name: "Mexico",
    flag: "🇲🇽",
    group: "A",
    primaryColor: "#006847",
    accentColor: "#CE1126",
  },
  {
    code: "RSA",
    name: "South Africa",
    flag: "🇿🇦",
    group: "A",
    primaryColor: "#007749",
    accentColor: "#FFB81C",
  },
  {
    code: "KOR",
    name: "South Korea",
    flag: "🇰🇷",
    group: "A",
    primaryColor: "#CD2E3A",
    accentColor: "#0047A0",
  },
  {
    code: "CZE",
    name: "Czechia",
    flag: "🇨🇿",
    group: "A",
    primaryColor: "#11457E",
    accentColor: "#D7141A",
  },
  // Group B
  {
    code: "CAN",
    name: "Canada",
    flag: "🇨🇦",
    group: "B",
    primaryColor: "#D52B1E",
    accentColor: "#1F1F1F",
  },
  {
    code: "BIH",
    name: "Bosnia and Herzegovina",
    flag: "🇧🇦",
    group: "B",
    primaryColor: "#002F6C",
    accentColor: "#FFCD00",
  },
  {
    code: "QAT",
    name: "Qatar",
    flag: "🇶🇦",
    group: "B",
    primaryColor: "#8A1538",
    accentColor: "#F5F5F5",
  },
  {
    code: "SUI",
    name: "Switzerland",
    flag: "🇨🇭",
    group: "B",
    primaryColor: "#D52B1E",
    accentColor: "#FFFFFF",
  },
  // Group C
  {
    code: "BRA",
    name: "Brazil",
    flag: "🇧🇷",
    group: "C",
    primaryColor: "#FFDF00",
    accentColor: "#009C3B",
  },
  {
    code: "MAR",
    name: "Morocco",
    flag: "🇲🇦",
    group: "C",
    primaryColor: "#C1272D",
    accentColor: "#006233",
  },
  {
    code: "HAI",
    name: "Haiti",
    flag: "🇭🇹",
    group: "C",
    primaryColor: "#00209F",
    accentColor: "#D21034",
  },
  {
    code: "SCO",
    name: "Scotland",
    flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    group: "C",
    primaryColor: "#0065BD",
    accentColor: "#FFFFFF",
  },
  // Group D
  {
    code: "USA",
    name: "United States",
    flag: "🇺🇸",
    group: "D",
    primaryColor: "#0A3161",
    accentColor: "#B31942",
  },
  {
    code: "PAR",
    name: "Paraguay",
    flag: "🇵🇾",
    group: "D",
    primaryColor: "#D52B1E",
    accentColor: "#0038A8",
  },
  {
    code: "AUS",
    name: "Australia",
    flag: "🇦🇺",
    group: "D",
    primaryColor: "#012169",
    accentColor: "#FFCD00",
  },
  {
    code: "TUR",
    name: "Türkiye",
    flag: "🇹🇷",
    group: "D",
    primaryColor: "#E30A17",
    accentColor: "#FFFFFF",
  },
  // Group E
  {
    code: "GER",
    name: "Germany",
    flag: "🇩🇪",
    group: "E",
    primaryColor: "#1F1F1F",
    accentColor: "#FFCE00",
  },
  {
    code: "CUW",
    name: "Curaçao",
    flag: "🇨🇼",
    group: "E",
    primaryColor: "#002B7F",
    accentColor: "#F9E814",
  },
  {
    code: "CIV",
    name: "Ivory Coast",
    flag: "🇨🇮",
    group: "E",
    primaryColor: "#F77F00",
    accentColor: "#009E60",
  },
  {
    code: "ECU",
    name: "Ecuador",
    flag: "🇪🇨",
    group: "E",
    primaryColor: "#FFD100",
    accentColor: "#0072CE",
  },
  // Group F
  {
    code: "NED",
    name: "Netherlands",
    flag: "🇳🇱",
    group: "F",
    primaryColor: "#F36C21",
    accentColor: "#21468B",
  },
  {
    code: "JPN",
    name: "Japan",
    flag: "🇯🇵",
    group: "F",
    primaryColor: "#BC002D",
    accentColor: "#0A1E3F",
  },
  {
    code: "SWE",
    name: "Sweden",
    flag: "🇸🇪",
    group: "F",
    primaryColor: "#006AA7",
    accentColor: "#FECC02",
  },
  {
    code: "TUN",
    name: "Tunisia",
    flag: "🇹🇳",
    group: "F",
    primaryColor: "#E70013",
    accentColor: "#FFFFFF",
  },
  // Group G
  {
    code: "BEL",
    name: "Belgium",
    flag: "🇧🇪",
    group: "G",
    primaryColor: "#ED2939",
    accentColor: "#FAE042",
  },
  {
    code: "EGY",
    name: "Egypt",
    flag: "🇪🇬",
    group: "G",
    primaryColor: "#CE1126",
    accentColor: "#000000",
  },
  {
    code: "IRN",
    name: "Iran",
    flag: "🇮🇷",
    group: "G",
    primaryColor: "#239F40",
    accentColor: "#DA0000",
  },
  {
    code: "NZL",
    name: "New Zealand",
    flag: "🇳🇿",
    group: "G",
    primaryColor: "#012169",
    accentColor: "#FFFFFF",
  },
  // Group H
  {
    code: "ESP",
    name: "Spain",
    flag: "🇪🇸",
    group: "H",
    primaryColor: "#AA151B",
    accentColor: "#F1BF00",
  },
  {
    code: "CPV",
    name: "Cape Verde",
    flag: "🇨🇻",
    group: "H",
    primaryColor: "#003893",
    accentColor: "#CF2027",
  },
  {
    code: "KSA",
    name: "Saudi Arabia",
    flag: "🇸🇦",
    group: "H",
    primaryColor: "#006C35",
    accentColor: "#FFFFFF",
  },
  {
    code: "URU",
    name: "Uruguay",
    flag: "🇺🇾",
    group: "H",
    primaryColor: "#0038A8",
    accentColor: "#FCD116",
  },
  // Group I
  {
    code: "FRA",
    name: "France",
    flag: "🇫🇷",
    group: "I",
    primaryColor: "#0055A4",
    accentColor: "#EF4135",
  },
  {
    code: "SEN",
    name: "Senegal",
    flag: "🇸🇳",
    group: "I",
    primaryColor: "#00853F",
    accentColor: "#FDEF42",
  },
  {
    code: "IRQ",
    name: "Iraq",
    flag: "🇮🇶",
    group: "I",
    primaryColor: "#CE1126",
    accentColor: "#007A3D",
  },
  {
    code: "NOR",
    name: "Norway",
    flag: "🇳🇴",
    group: "I",
    primaryColor: "#BA0C2F",
    accentColor: "#00205B",
  },
  // Group J
  {
    code: "ARG",
    name: "Argentina",
    flag: "🇦🇷",
    group: "J",
    primaryColor: "#74ACDF",
    accentColor: "#F6B40E",
  },
  {
    code: "ALG",
    name: "Algeria",
    flag: "🇩🇿",
    group: "J",
    primaryColor: "#006233",
    accentColor: "#D21034",
  },
  {
    code: "AUT",
    name: "Austria",
    flag: "🇦🇹",
    group: "J",
    primaryColor: "#ED2939",
    accentColor: "#FFFFFF",
  },
  {
    code: "JOR",
    name: "Jordan",
    flag: "🇯🇴",
    group: "J",
    primaryColor: "#000000",
    accentColor: "#CE1126",
  },
  // Group K
  {
    code: "POR",
    name: "Portugal",
    flag: "🇵🇹",
    group: "K",
    primaryColor: "#046A38",
    accentColor: "#DA291C",
  },
  {
    code: "COD",
    name: "DR Congo",
    flag: "🇨🇩",
    group: "K",
    primaryColor: "#007FFF",
    accentColor: "#F7D618",
  },
  {
    code: "UZB",
    name: "Uzbekistan",
    flag: "🇺🇿",
    group: "K",
    primaryColor: "#1EB53A",
    accentColor: "#0099B5",
  },
  {
    code: "COL",
    name: "Colombia",
    flag: "🇨🇴",
    group: "K",
    primaryColor: "#FCD116",
    accentColor: "#003893",
  },
  // Group L
  {
    code: "ENG",
    name: "England",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    group: "L",
    primaryColor: "#FFFFFF",
    accentColor: "#CE1124",
  },
  {
    code: "CRO",
    name: "Croatia",
    flag: "🇭🇷",
    group: "L",
    primaryColor: "#FF0000",
    accentColor: "#171796",
  },
  {
    code: "GHA",
    name: "Ghana",
    flag: "🇬🇭",
    group: "L",
    primaryColor: "#CE1126",
    accentColor: "#FCD116",
  },
  {
    code: "PAN",
    name: "Panama",
    flag: "🇵🇦",
    group: "L",
    primaryColor: "#072357",
    accentColor: "#DA121A",
  },
];

function buildTeamStickers(code: string): Sticker[] {
  return Array.from({ length: STICKERS_PER_TEAM }, (_, i) => {
    const number = i + 1;
    const stickerCode = `${code}${number}`;
    return {
      id: stickerCode,
      code: stickerCode,
      number,
      category: "TEAM" as const,
    };
  });
}

export const TEAMS: Team[] = TEAM_SEEDS.map((seed, index) => ({
  ...seed,
  albumOrder: index + 1,
  stickers: buildTeamStickers(seed.code),
}));

export const TEAMS_BY_GROUP: Record<string, Team[]> = TEAMS.reduce<Record<string, Team[]>>(
  (acc, team) => {
    if (!acc[team.group]) acc[team.group] = [];
    acc[team.group].push(team);
    return acc;
  },
  {}
);

export const TEAM_GROUP_ORDER = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
