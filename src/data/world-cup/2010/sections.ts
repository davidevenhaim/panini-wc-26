import type { AlbumSection } from "@/collections/schema";
import generated from "./items.generated.json";

// Generated from public/wc-2010.json via
// `pnpm albums:import:laststicker`. Adds A–H group letters (album-order
// draw, 4 teams per group) plus flag and colour metadata for the WC26
// grouped renderer.

type Decoration = { flag: string; primary: string; accent: string };

const TEAM_DECORATIONS: Record<string, Decoration> = {
  RSA: { flag: "🇿🇦", primary: "#007A4D", accent: "#FFB81C" },
  MEX: { flag: "🇲🇽", primary: "#006847", accent: "#CE1126" },
  URU: { flag: "🇺🇾", primary: "#7B9BD4", accent: "#FFFFFF" },
  FRA: { flag: "🇫🇷", primary: "#0055A4", accent: "#EF4135" },
  ARG: { flag: "🇦🇷", primary: "#75AADB", accent: "#FFFFFF" },
  NGA: { flag: "🇳🇬", primary: "#008753", accent: "#FFFFFF" },
  KOR: { flag: "🇰🇷", primary: "#CD2E3A", accent: "#0047A0" },
  GRE: { flag: "🇬🇷", primary: "#0D5EAF", accent: "#FFFFFF" },
  ENG: { flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", primary: "#FFFFFF", accent: "#CE1124" },
  USA: { flag: "🇺🇸", primary: "#3C3B6E", accent: "#B22234" },
  ALG: { flag: "🇩🇿", primary: "#006233", accent: "#FFFFFF" },
  SVN: { flag: "🇸🇮", primary: "#005DA4", accent: "#ED1C24" },
  GER: { flag: "🇩🇪", primary: "#000000", accent: "#DD0000" },
  AUS: { flag: "🇦🇺", primary: "#00843D", accent: "#FFCD00" },
  SRB: { flag: "🇷🇸", primary: "#C6363C", accent: "#0C4076" },
  GHA: { flag: "🇬🇭", primary: "#FCD116", accent: "#006B3F" },
  NED: { flag: "🇳🇱", primary: "#AE1C28", accent: "#21468B" },
  DEN: { flag: "🇩🇰", primary: "#C8102E", accent: "#FFFFFF" },
  JPN: { flag: "🇯🇵", primary: "#BC002D", accent: "#FFFFFF" },
  CMR: { flag: "🇨🇲", primary: "#007A5E", accent: "#CE1126" },
  ITA: { flag: "🇮🇹", primary: "#009246", accent: "#CE2B37" },
  PAR: { flag: "🇵🇾", primary: "#D52B1E", accent: "#0038A8" },
  NZL: { flag: "🇳🇿", primary: "#000000", accent: "#FFFFFF" },
  SVK: { flag: "🇸🇰", primary: "#0B4EA2", accent: "#EE1C25" },
  BRA: { flag: "🇧🇷", primary: "#FEDF00", accent: "#009C3B" },
  PRK: { flag: "🇰🇵", primary: "#024FA2", accent: "#ED1C27" },
  CIV: { flag: "🇨🇮", primary: "#FF8200", accent: "#009A44" },
  POR: { flag: "🇵🇹", primary: "#046A38", accent: "#DA291C" },
  ESP: { flag: "🇪🇸", primary: "#AA151B", accent: "#F1BF00" },
  SUI: { flag: "🇨🇭", primary: "#FF0000", accent: "#FFFFFF" },
  HON: { flag: "🇭🇳", primary: "#0073CF", accent: "#FFFFFF" },
  CHI: { flag: "🇨🇱", primary: "#0033A0", accent: "#D52B1E" },
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

export const WC_2010_SECTIONS: AlbumSection[] = enrich();
