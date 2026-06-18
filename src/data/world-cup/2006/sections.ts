import type { AlbumSection } from "@/collections/schema";
import generated from "./items.generated.json";

// Generated from public/wc-2006.json via
// `pnpm albums:import:laststicker`. Adds A–H group letters (album-order
// draw, 4 teams per group) plus flag and colour metadata for the WC26
// grouped renderer.

type Decoration = { flag: string; primary: string; accent: string };

const TEAM_DECORATIONS: Record<string, Decoration> = {
  GER: { flag: "🇩🇪", primary: "#000000", accent: "#DD0000" },
  CRC: { flag: "🇨🇷", primary: "#002B7F", accent: "#CE1126" },
  POL: { flag: "🇵🇱", primary: "#FFFFFF", accent: "#DC143C" },
  ECU: { flag: "🇪🇨", primary: "#FFD100", accent: "#0072CE" },
  ENG: { flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", primary: "#FFFFFF", accent: "#CE1124" },
  PAR: { flag: "🇵🇾", primary: "#D52B1E", accent: "#0038A8" },
  TRI: { flag: "🇹🇹", primary: "#DA1A35", accent: "#000000" },
  SWE: { flag: "🇸🇪", primary: "#005293", accent: "#FECB00" },
  ARG: { flag: "🇦🇷", primary: "#75AADB", accent: "#FFFFFF" },
  CIV: { flag: "🇨🇮", primary: "#FF8200", accent: "#009A44" },
  SCG: { flag: "🇷🇸", primary: "#C6363C", accent: "#0C4076" },
  NED: { flag: "🇳🇱", primary: "#AE1C28", accent: "#21468B" },
  MEX: { flag: "🇲🇽", primary: "#006847", accent: "#CE1126" },
  IRN: { flag: "🇮🇷", primary: "#239F40", accent: "#DA0000" },
  ANG: { flag: "🇦🇴", primary: "#CE1126", accent: "#000000" },
  POR: { flag: "🇵🇹", primary: "#046A38", accent: "#DA291C" },
  ITA: { flag: "🇮🇹", primary: "#009246", accent: "#CE2B37" },
  GHA: { flag: "🇬🇭", primary: "#FCD116", accent: "#006B3F" },
  USA: { flag: "🇺🇸", primary: "#3C3B6E", accent: "#B22234" },
  CZE: { flag: "🇨🇿", primary: "#11457E", accent: "#D7141A" },
  BRA: { flag: "🇧🇷", primary: "#FEDF00", accent: "#009C3B" },
  CRO: { flag: "🇭🇷", primary: "#171796", accent: "#FF0000" },
  AUS: { flag: "🇦🇺", primary: "#00843D", accent: "#FFCD00" },
  JPN: { flag: "🇯🇵", primary: "#BC002D", accent: "#FFFFFF" },
  FRA: { flag: "🇫🇷", primary: "#0055A4", accent: "#EF4135" },
  SUI: { flag: "🇨🇭", primary: "#FF0000", accent: "#FFFFFF" },
  KOR: { flag: "🇰🇷", primary: "#CD2E3A", accent: "#0047A0" },
  TOG: { flag: "🇹🇬", primary: "#006A4E", accent: "#FFCE00" },
  ESP: { flag: "🇪🇸", primary: "#AA151B", accent: "#F1BF00" },
  UKR: { flag: "🇺🇦", primary: "#0057B7", accent: "#FFD700" },
  TUN: { flag: "🇹🇳", primary: "#E70013", accent: "#FFFFFF" },
  KSA: { flag: "🇸🇦", primary: "#006C35", accent: "#FFFFFF" },
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

export const WC_2006_SECTIONS: AlbumSection[] = enrich();
