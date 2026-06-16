import type { Sticker } from "@/types/album.types";
import {
  BONUS_SECTION,
  FWC_CLOSING_SECTION,
  FWC_OPENING_SECTION,
  PANINI_LOGO_SECTION,
  TEAMS,
} from "@/constants/album";
import { getQuantity, type Quantities } from "./collection";

export type GroupedBucket = {
  id: string;
  title: string;
  /** Codes that meet the criterion, in album order. */
  codes: string[];
  /** Optional per-code duplicate count for the duplicates view. */
  counts?: Record<string, number>;
};

function bucketsFor(
  predicate: (qty: number) => boolean,
  quantities: Quantities,
  withCounts: boolean
): GroupedBucket[] {
  const result: GroupedBucket[] = [];

  const tryAdd = (id: string, title: string, stickers: Sticker[]) => {
    const codes: string[] = [];
    const counts: Record<string, number> = {};
    for (const s of stickers) {
      const qty = getQuantity(quantities, s.code);
      if (predicate(qty)) {
        codes.push(s.code);
        if (withCounts) counts[s.code] = Math.max(0, qty - 1);
      }
    }
    if (codes.length) result.push({ id, title, codes, counts: withCounts ? counts : undefined });
  };

  tryAdd(PANINI_LOGO_SECTION.id, "Panini logo", PANINI_LOGO_SECTION.stickers);
  tryAdd(FWC_OPENING_SECTION.id, "FWC 1–8", FWC_OPENING_SECTION.stickers);

  for (const team of TEAMS) {
    tryAdd(team.code, `${team.flag} ${team.name} (${team.code})`, team.stickers);
  }

  tryAdd(FWC_CLOSING_SECTION.id, "FWC 9–19", FWC_CLOSING_SECTION.stickers);
  tryAdd(BONUS_SECTION.id, "Coca-Cola bonus", BONUS_SECTION.stickers);

  return result;
}

/** Groups missing stickers by team (in album order). */
export function groupMissingByTeam(quantities: Quantities): GroupedBucket[] {
  return bucketsFor((qty) => qty === 0, quantities, false);
}

/** Groups duplicates (qty >= 2) by team with per-code duplicate counts. */
export function groupDuplicatesByTeam(quantities: Quantities): GroupedBucket[] {
  return bucketsFor((qty) => qty >= 2, quantities, true);
}
