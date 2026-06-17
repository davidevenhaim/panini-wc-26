import type { CollectibleItem } from "@/collections/schema";
import { WC_2018_SECTIONS } from "./sections";

export const WC_2018_ITEMS: CollectibleItem[] = WC_2018_SECTIONS.flatMap((s) => s.items);
