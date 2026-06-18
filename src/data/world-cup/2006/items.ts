import type { CollectibleItem } from "@/collections/schema";
import { WC_2006_SECTIONS } from "./sections";

export const WC_2006_ITEMS: CollectibleItem[] = WC_2006_SECTIONS.flatMap((s) => s.items);
