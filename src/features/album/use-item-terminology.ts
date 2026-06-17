"use client";

import { useTranslations } from "next-intl";
import type { Album } from "@/collections/schema";

/**
 * Returns the user-facing term set for an album. Sticker albums and
 * card (Adrenalyn) albums must use distinct vocabulary in lists,
 * dialog buttons and report context.
 */
export type ItemTerminology = {
  singular: string;
  plural: string;
  missingTitle: string;
  duplicatesTitle: string;
  markSectionComplete: string;
};

export function useItemTerminology(album: Pick<Album, "itemType">): ItemTerminology {
  const t = useTranslations();
  const isCard = album.itemType === "CARD";
  return {
    singular: isCard ? t("album.itemTerm.cardSingular") : t("album.itemTerm.stickerSingular"),
    plural: isCard ? t("album.itemTerm.cardPlural") : t("album.itemTerm.stickerPlural"),
    missingTitle: isCard ? t("album.itemTerm.cardMissing") : t("album.itemTerm.stickerMissing"),
    duplicatesTitle: isCard
      ? t("album.itemTerm.cardDuplicates")
      : t("album.itemTerm.stickerDuplicates"),
    markSectionComplete: isCard
      ? t("album.itemTerm.cardMarkSectionComplete")
      : t("album.itemTerm.stickerMarkSectionComplete"),
  };
}
