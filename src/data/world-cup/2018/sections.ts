import type { AlbumSection } from "@/collections/schema";
import generated from "./items.generated.json";

// Generated from public/wc-2018.json via `pnpm albums:import:laststicker`.
// Adds A–H group letters (album-order draw, 4 teams per group) plus flag
// and colour metadata for the WC26 grouped renderer.

type Decoration = { flag: string; primary: string; accent: string };

const TEAM_DECORATIONS: Record<string, Decoration> = {
  RUS: { flag: "🇷🇺", primary: "#0039A6", accent: "#D52B1E" },
  KSA: { flag: "🇸🇦", primary: "#006C35", accent: "#FFFFFF" },
  EGY: { flag: "🇪🇬", primary: "#CE1126", accent: "#000000" },
  URU: { flag: "🇺🇾", primary: "#7B9BD4", accent: "#FFFFFF" },
  POR: { flag: "🇵🇹", primary: "#046A38", accent: "#DA291C" },
  ESP: { flag: "🇪🇸", primary: "#AA151B", accent: "#F1BF00" },
  MAR: { flag: "🇲🇦", primary: "#C1272D", accent: "#006233" },
  IRN: { flag: "🇮🇷", primary: "#239F40", accent: "#DA0000" },
  FRA: { flag: "🇫🇷", primary: "#0055A4", accent: "#EF4135" },
  AUS: { flag: "🇦🇺", primary: "#00843D", accent: "#FFCD00" },
  PER: { flag: "🇵🇪", primary: "#D91023", accent: "#FFFFFF" },
  DEN: { flag: "🇩🇰", primary: "#C60C30", accent: "#FFFFFF" },
  ARG: { flag: "🇦🇷", primary: "#75AADB", accent: "#FFFFFF" },
  ISL: { flag: "🇮🇸", primary: "#02529C", accent: "#DC1E35" },
  CRO: { flag: "🇭🇷", primary: "#171796", accent: "#FF0000" },
  NGA: { flag: "🇳🇬", primary: "#008753", accent: "#FFFFFF" },
  BRA: { flag: "🇧🇷", primary: "#FEDF00", accent: "#009C3B" },
  SUI: { flag: "🇨🇭", primary: "#FF0000", accent: "#FFFFFF" },
  CRC: { flag: "🇨🇷", primary: "#002B7F", accent: "#CE1126" },
  SRB: { flag: "🇷🇸", primary: "#C6363C", accent: "#0C4076" },
  GER: { flag: "🇩🇪", primary: "#000000", accent: "#DD0000" },
  MEX: { flag: "🇲🇽", primary: "#006847", accent: "#CE1126" },
  SWE: { flag: "🇸🇪", primary: "#006AA7", accent: "#FECC00" },
  KOR: { flag: "🇰🇷", primary: "#CD2E3A", accent: "#0047A0" },
  BEL: { flag: "🇧🇪", primary: "#000000", accent: "#FFD90C" },
  PAN: { flag: "🇵🇦", primary: "#005AA7", accent: "#D21034" },
  TUN: { flag: "🇹🇳", primary: "#E70013", accent: "#FFFFFF" },
  ENG: { flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", primary: "#FFFFFF", accent: "#CE1124" },
  POL: { flag: "🇵🇱", primary: "#DC143C", accent: "#FFFFFF" },
  SEN: { flag: "🇸🇳", primary: "#00853F", accent: "#FDEF42" },
  COL: { flag: "🇨🇴", primary: "#FCD116", accent: "#003893" },
  JPN: { flag: "🇯🇵", primary: "#BC002D", accent: "#FFFFFF" },
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

export const WC_2018_SECTIONS: AlbumSection[] = enrich();
