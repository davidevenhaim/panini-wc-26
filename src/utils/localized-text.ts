import type { LocalizedText } from "@/collections/schema";
import type { AppLocale } from "@/constants/locale";

/** Pick the best localized string for the active app locale. */
export function pickLocalizedText(
  text: LocalizedText | undefined | null,
  locale: AppLocale
): string {
  if (!text) return "";
  if (locale === "he" || locale === "ar") return text.he ?? text.en ?? "";
  return text.en ?? text.he ?? "";
}
