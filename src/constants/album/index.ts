import type { Sticker, Team, SpecialSection } from "@/types/album.types";
import { TEAMS, TEAMS_BY_GROUP, TEAM_GROUP_ORDER } from "./teams.constants";
import {
  BONUS_SECTION,
  FWC_CLOSING_SECTION,
  FWC_OPENING_SECTION,
  PANINI_LOGO_SECTION,
} from "./sections.constants";

export { TEAMS, TEAMS_BY_GROUP, TEAM_GROUP_ORDER };
export { BONUS_SECTION, FWC_CLOSING_SECTION, FWC_OPENING_SECTION, PANINI_LOGO_SECTION };

/** Sections that count toward the 980-sticker main album, in album order. */
export const MAIN_ALBUM_SECTIONS: SpecialSection[] = [
  PANINI_LOGO_SECTION,
  FWC_OPENING_SECTION,
  FWC_CLOSING_SECTION,
];

/** Section displayed separately and does NOT count toward the 980. */
export const BONUS_SECTIONS: SpecialSection[] = [BONUS_SECTION];

/** Every sticker that counts toward the 980 (in album reading order). */
export const ALBUM_STICKERS: Sticker[] = [
  ...PANINI_LOGO_SECTION.stickers,
  ...FWC_OPENING_SECTION.stickers,
  ...TEAMS.flatMap((t) => t.stickers),
  ...FWC_CLOSING_SECTION.stickers,
];

/** Bonus stickers (Coca-Cola). */
export const BONUS_STICKERS: Sticker[] = BONUS_SECTION.stickers;

/** Fast lookup by code. */
export const STICKER_INDEX: Record<string, Sticker> = [...ALBUM_STICKERS, ...BONUS_STICKERS].reduce<
  Record<string, Sticker>
>((acc, s) => {
  acc[s.code] = s;
  return acc;
}, {});

export const TEAM_INDEX: Record<string, Team> = TEAMS.reduce<Record<string, Team>>((acc, t) => {
  acc[t.code] = t;
  return acc;
}, {});

export const TOTAL_ALBUM_STICKERS = ALBUM_STICKERS.length; // expected 980
export const TOTAL_BONUS_STICKERS = BONUS_STICKERS.length; // expected 12
