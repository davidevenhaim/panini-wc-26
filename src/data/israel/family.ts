import type { CollectionFamily } from "@/collections/schema";

export const ISRAEL_FAMILY: CollectionFamily = {
  id: "israeli-football-albums",
  slug: "israel",
  name: {
    en: "Israeli football albums",
    he: "אלבומי כדורגל ישראליים",
  },
  description: {
    en: "Israeli league sticker albums — legacy Supergol era and the current Football Stars series.",
    he: "אלבומי מדבקות של ליגת העל — סדרת סופרגול הקלאסית וסדרת ׳הכוכבים של הכדורגל׳ העדכנית.",
  },
  publisher: "Various",
  region: "ISRAEL",
  theme: {
    primary: "#0038b8",
    secondary: "#dc2626",
    accent: "#facc15",
    direction: "rtl",
  },
};
