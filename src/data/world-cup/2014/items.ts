import type { CollectibleItem } from "@/collections/schema";
import { WC_2014_SECTIONS } from "./sections";

export const WC_2014_ITEMS: CollectibleItem[] = WC_2014_SECTIONS.flatMap((s) => s.items);
