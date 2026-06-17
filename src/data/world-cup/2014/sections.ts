import type { AlbumSection } from "@/collections/schema";
import generated from "./items.generated.json";

// Generated from public/wc-2014.json via
// `pnpm albums:import:laststicker`. Adds A–H group letters (album-order
// draw, 4 teams per group) plus flag and colour metadata for the WC26
// grouped renderer.

type Decoration = { flag: string; primary: string; accent: string };

const TEAM_DECORATIONS: Record<string, Decoration> = {
  BRA: { flag: "🇧🇷", primary: "#FEDF00", accent: "#009C3B" },
  CRO: { flag: "🇭🇷", primary: "#171796", accent: "#FF0000" },
  MEX: { flag: "🇲🇽", primary: "#006847", accent: "#CE1126" },
  CMR: { flag: "🇨🇲", primary: "#007A5E", accent: "#CE1126" },
  ESP: { flag: "🇪🇸", primary: "#AA151B", accent: "#F1BF00" },
  NED: { flag: "🇳🇱", primary: "#AE1C28", accent: "#21468B" },
  CHI: { flag: "🇨🇱", primary: "#0033A0", accent: "#D52B1E" },
  AUS: { flag: "🇦🇺", primary: "#00843D", accent: "#FFCD00" },
  COL: { flag: "🇨🇴", primary: "#FCD116", accent: "#003893" },
  GRE: { flag: "🇬🇷", primary: "#0D5EAF", accent: "#FFFFFF" },
  CIV: { flag: "🇨🇮", primary: "#FF8200", accent: "#009A44" },
  JPN: { flag: "🇯🇵", primary: "#BC002D", accent: "#FFFFFF" },
  URU: { flag: "🇺🇾", primary: "#7B9BD4", accent: "#FFFFFF" },
  CRC: { flag: "🇨🇷", primary: "#002B7F", accent: "#CE1126" },
  ENG: { flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", primary: "#FFFFFF", accent: "#CE1124" },
  ITA: { flag: "🇮🇹", primary: "#009246", accent: "#CE2B37" },
  SUI: { flag: "🇨🇭", primary: "#FF0000", accent: "#FFFFFF" },
  ECU: { flag: "🇪🇨", primary: "#FFD100", accent: "#0072CE" },
  FRA: { flag: "🇫🇷", primary: "#0055A4", accent: "#EF4135" },
  HON: { flag: "🇭🇳", primary: "#0073CF", accent: "#FFFFFF" },
  ARG: { flag: "🇦🇷", primary: "#75AADB", accent: "#FFFFFF" },
  BIH: { flag: "🇧🇦", primary: "#002F6C", accent: "#FECB00" },
  IRN: { flag: "🇮🇷", primary: "#239F40", accent: "#DA0000" },
  NGA: { flag: "🇳🇬", primary: "#008753", accent: "#FFFFFF" },
  GER: { flag: "🇩🇪", primary: "#000000", accent: "#DD0000" },
  POR: { flag: "🇵🇹", primary: "#046A38", accent: "#DA291C" },
  GHA: { flag: "🇬🇭", primary: "#FCD116", accent: "#006B3F" },
  USA: { flag: "🇺🇸", primary: "#3C3B6E", accent: "#B22234" },
  BEL: { flag: "🇧🇪", primary: "#000000", accent: "#FFD90C" },
  ALG: { flag: "🇩🇿", primary: "#006233", accent: "#FFFFFF" },
  RUS: { flag: "🇷🇺", primary: "#0039A6", accent: "#D52B1E" },
  KOR: { flag: "🇰🇷", primary: "#CD2E3A", accent: "#0047A0" },
};

const GROUP_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"] as const;

function enrich(): AlbumSection[] {
  const raw = generated.sections as AlbumSection[];
  let teamIndex = 0;
  return raw.map((section) => {
    if (section.entityType !== "NATIONAL_TEAM") return section;
    const groupLetter = GROUP_LETTERS[Math.floor(teamIndex / 4)] ?? "?";
    const code = section.badge ?? "";
    const dec = TEAM_DECORATIONS[code];
    teamIndex++;
    return {
      ...section,
      group: groupLetter,
      ...(dec
        ? {
            flag: dec.flag,
            primaryColor: dec.primary,
            accentColor: dec.accent,
          }
        : {}),
    };
  });
}

export const WC_2014_SECTIONS: AlbumSection[] = enrich();
