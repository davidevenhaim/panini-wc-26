"use client";

import { useCallback } from "react";
import { useLocale } from "next-intl";
import type { LocalizedText } from "@/collections/schema";
import { resolveAppLocale } from "@/constants/locale";
import { pickLocalizedText } from "@/utils/localized-text";

/** Returns a stable `lt(text)` helper bound to the current UI locale. */
export function useLocalizedText() {
  const locale = resolveAppLocale(useLocale());
  return useCallback(
    (text: LocalizedText | undefined | null) => pickLocalizedText(text, locale),
    [locale]
  );
}
