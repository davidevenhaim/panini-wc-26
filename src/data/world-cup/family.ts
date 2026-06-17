import type { CollectionFamily } from "@/collections/schema";

export const WORLD_CUP_FAMILY: CollectionFamily = {
  id: "panini-world-cup",
  slug: "world-cup",
  name: {
    en: "FIFA World Cup",
    he: 'מונדיאל פיפ"א',
  },
  description: {
    en: "Panini's official FIFA World Cup sticker albums.",
    he: "אלבומי המדבקות הרשמיים של פאניני לטורניר המונדיאל.",
  },
  publisher: "Panini",
  region: "GLOBAL",
  theme: {
    primary: "#10b981",
    secondary: "#0ea5e9",
    accent: "#facc15",
    direction: "ltr",
  },
};
