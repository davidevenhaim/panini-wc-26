import type { ChecklistSource } from "@/collections/schema";

export const WC_2026_ADRENALYN_SOURCES: ChecklistSource[] = [
  {
    label: "Panini FIFA World Cup 2026 — Adrenalyn XL Official Checklist (PDF)",
    url: "https://www.panini.co.uk/media/paniniFiles/005461_FIFA_WC_2026_Checklist.pdf",
    notes:
      "Canonical source for the 630-card base-binder structure. Used to anchor category ranges (Golden Ballers 1–9, national teams 10–513 split into 42 × 12-card blocks, Contenders 514–549, special categories 550–630).",
  },
];

/**
 * Cards / sets intentionally excluded from the 630-card base-binder
 * completion target. Tracked as standalone EXTRAs.
 */
export const WC_2026_ADRENALYN_EXTRAS_NOTES: string[] = [
  "Momentum cards (Jude Bellingham, Ousmane Dembélé, Christian Pulisic) — distributed separately",
  "Limited Editions — counts vary by market and product; checklist pending",
  "Product-exclusive cards (online challenges, upgrade sets, retail boosters) — pending",
];
