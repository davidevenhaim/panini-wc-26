import type { Sticker, SpecialSection } from "@/types/album.types";

function makeStickers(
  prefix: string,
  count: number,
  startNumber = 1,
  category: Sticker["category"] = "FWC"
): Sticker[] {
  return Array.from({ length: count }, (_, i) => {
    const number = startNumber + i;
    const code = `${prefix}${number}`;
    return { id: code, code, number, category };
  });
}

/** Sticker #00 — Panini badge */
export const PANINI_LOGO_STICKER: Sticker = {
  id: "LOGO",
  code: "LOGO",
  number: 0,
  category: "LOGO",
};

export const PANINI_LOGO_SECTION: SpecialSection = {
  id: "panini-logo",
  i18nKey: "paniniLogo",
  stickers: [PANINI_LOGO_STICKER],
  countsTowardAlbum: true,
};

/** Opening tournament stickers — FWC1 to FWC8 */
export const FWC_OPENING_SECTION: SpecialSection = {
  id: "fwc-opening",
  i18nKey: "openingFwc",
  stickers: makeStickers("FWC", 8, 1, "FWC"),
  countsTowardAlbum: true,
};

/** Closing FWC stickers — FWC9 to FWC19 */
export const FWC_CLOSING_SECTION: SpecialSection = {
  id: "fwc-closing",
  i18nKey: "closingFwc",
  stickers: makeStickers("FWC", 11, 9, "FWC"),
  countsTowardAlbum: true,
};

/** Coca-Cola bonus collection — 12 stickers, do NOT count toward the 980. */
export const BONUS_SECTION: SpecialSection = {
  id: "bonus-coca-cola",
  i18nKey: "bonus",
  stickers: makeStickers("BNS", 12, 1, "BONUS"),
  countsTowardAlbum: false,
};
