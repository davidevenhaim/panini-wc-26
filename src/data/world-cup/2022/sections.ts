import type { AlbumSection } from "@/collections/schema";
import generated from "./items.generated.json";

// Generated from the LastSticker bundled payload via
// `pnpm albums:import:laststicker`. Section content is JSON-imported;
// this file enriches each NATIONAL_TEAM section with the World Cup 2022
// group letter (A–H, four teams per group in album order) and provides
// flag + colour metadata used by the grouped renderer.

type Decoration = { flag: string; primary: string; accent: string };

const TEAM_DECORATIONS: Record<string, Decoration> = {
  QAT: { flag: "🇶🇦", primary: "#7c1d3f", accent: "#FFFFFF" },
  ECU: { flag: "🇪🇨", primary: "#FFD100", accent: "#0072CE" },
  SEN: { flag: "🇸🇳", primary: "#00853F", accent: "#FDEF42" },
  NED: { flag: "🇳🇱", primary: "#AE1C28", accent: "#21468B" },
  ENG: { flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", primary: "#FFFFFF", accent: "#CE1124" },
  IRN: { flag: "🇮🇷", primary: "#239F40", accent: "#DA0000" },
  USA: { flag: "🇺🇸", primary: "#3C3B6E", accent: "#B22234" },
  WAL: { flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", primary: "#CE1124", accent: "#00B140" },
  ARG: { flag: "🇦🇷", primary: "#75AADB", accent: "#FFFFFF" },
  KSA: { flag: "🇸🇦", primary: "#006C35", accent: "#FFFFFF" },
  MEX: { flag: "🇲🇽", primary: "#006847", accent: "#CE1126" },
  POL: { flag: "🇵🇱", primary: "#DC143C", accent: "#FFFFFF" },
  FRA: { flag: "🇫🇷", primary: "#0055A4", accent: "#EF4135" },
  AUS: { flag: "🇦🇺", primary: "#00843D", accent: "#FFCD00" },
  DEN: { flag: "🇩🇰", primary: "#C60C30", accent: "#FFFFFF" },
  TUN: { flag: "🇹🇳", primary: "#E70013", accent: "#FFFFFF" },
  ESP: { flag: "🇪🇸", primary: "#AA151B", accent: "#F1BF00" },
  CRC: { flag: "🇨🇷", primary: "#002B7F", accent: "#CE1126" },
  GER: { flag: "🇩🇪", primary: "#000000", accent: "#DD0000" },
  JPN: { flag: "🇯🇵", primary: "#BC002D", accent: "#FFFFFF" },
  BEL: { flag: "🇧🇪", primary: "#000000", accent: "#FFD90C" },
  CAN: { flag: "🇨🇦", primary: "#FF0000", accent: "#FFFFFF" },
  MAR: { flag: "🇲🇦", primary: "#C1272D", accent: "#006233" },
  CRO: { flag: "🇭🇷", primary: "#171796", accent: "#FF0000" },
  BRA: { flag: "🇧🇷", primary: "#FEDF00", accent: "#009C3B" },
  SRB: { flag: "🇷🇸", primary: "#C6363C", accent: "#0C4076" },
  SUI: { flag: "🇨🇭", primary: "#FF0000", accent: "#FFFFFF" },
  CMR: { flag: "🇨🇲", primary: "#007A5E", accent: "#CE1126" },
  POR: { flag: "🇵🇹", primary: "#046A38", accent: "#DA291C" },
  GHA: { flag: "🇬🇭", primary: "#FCD116", accent: "#006B3F" },
  URU: { flag: "🇺🇾", primary: "#7B9BD4", accent: "#FFFFFF" },
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

export const WC_2022_SECTIONS: AlbumSection[] = enrich();
