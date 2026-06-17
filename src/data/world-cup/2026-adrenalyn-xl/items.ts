import type { CollectibleItem } from "@/collections/schema";
import { WC_2026_ADRENALYN_SECTIONS } from "./sections";

export const WC_2026_ADRENALYN_ITEMS: CollectibleItem[] = WC_2026_ADRENALYN_SECTIONS.flatMap(
  (s) => s.items
);
