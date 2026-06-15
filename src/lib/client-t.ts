const TRANSLATIONS = {
  en: { toastServerError: "Server error", toastRequestFailed: "Request failed" },
  he: { toastServerError: "שגיאת שרת", toastRequestFailed: "הבקשה נכשלה" },
  es: { toastServerError: "Error del servidor", toastRequestFailed: "Solicitud fallida" },
  ar: { toastServerError: "خطأ في الخادم", toastRequestFailed: "فشل الطلب" },
} as const;

type ClientKey = keyof (typeof TRANSLATIONS)["en"];

/**
 * Locale-aware string lookup for non-React contexts (e.g. Axios interceptors).
 * Reads NEXT_LOCALE from the cookie — no React context required.
 */
export function clientT(key: ClientKey): string {
  const locale =
    typeof document !== "undefined"
      ? (document.cookie.match(/NEXT_LOCALE=([^;]+)/)?.[1] ?? "en")
      : "en";
  return (TRANSLATIONS[locale as keyof typeof TRANSLATIONS] ?? TRANSLATIONS.en)[key];
}
