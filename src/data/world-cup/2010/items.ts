import type { CollectibleItem } from "@/collections/schema";
import { WC_2010_SECTIONS } from "./sections";

export const WC_2010_ITEMS: CollectibleItem[] = WC_2010_SECTIONS.flatMap((s) => s.items);
