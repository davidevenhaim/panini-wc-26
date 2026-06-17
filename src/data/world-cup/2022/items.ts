import type { CollectibleItem } from "@/collections/schema";
import { WC_2022_SECTIONS } from "./sections";

export const WC_2022_ITEMS: CollectibleItem[] = WC_2022_SECTIONS.flatMap((s) => s.items);
