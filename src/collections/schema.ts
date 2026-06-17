import { z } from "zod";

/* ── Primitives ───────────────────────────────────────────────────────────── */

export const LocalizedTextSchema = z.object({
  en: z.string().optional(),
  he: z.string().optional(),
});
export type LocalizedText = z.infer<typeof LocalizedTextSchema>;

export const CollectionThemeSchema = z.object({
  primary: z.string(),
  secondary: z.string().optional(),
  accent: z.string().optional(),
  surface: z.string().optional(),
  background: z.string().optional(),
  direction: z.enum(["ltr", "rtl"]).optional(),
});
export type CollectionTheme = z.infer<typeof CollectionThemeSchema>;

export const ChecklistSourceSchema = z.object({
  label: z.string(),
  url: z.string().url().optional(),
  accessedAt: z.string().optional(),
  notes: z.string().optional(),
});
export type ChecklistSource = z.infer<typeof ChecklistSourceSchema>;

export const AlbumDataStatusSchema = z.enum([
  "verified-complete",
  "verified-partial",
  "metadata-only",
]);
export type AlbumDataStatus = z.infer<typeof AlbumDataStatusSchema>;

export const ChecklistVerificationSchema = z.object({
  status: AlbumDataStatusSchema,
  verifiedAt: z.string().optional(),
  verifiedBy: z.string().optional(),
  sources: z.array(ChecklistSourceSchema).default([]),
  notes: z.array(z.string()).optional(),
});
export type ChecklistVerification = z.infer<typeof ChecklistVerificationSchema>;

export const ItemAvailabilitySchema = z.enum(["PACK", "PROMO", "SPECIAL", "UNKNOWN"]);
export type ItemAvailability = z.infer<typeof ItemAvailabilitySchema>;

/* ── Items + sections ─────────────────────────────────────────────────────── */

export const CollectibleItemSchema = z.object({
  id: z.string(),
  albumId: z.string(),
  sectionId: z.string(),
  code: z.string(),
  displayNumber: z.string().optional(),
  name: LocalizedTextSchema.optional(),
  playerName: LocalizedTextSchema.optional(),
  teamName: LocalizedTextSchema.optional(),
  category: z.string().optional(),
  order: z.number().int(),
  isRequiredForCompletion: z.boolean().default(true),
  availability: ItemAvailabilitySchema.optional(),
});
export type CollectibleItem = z.infer<typeof CollectibleItemSchema>;

export const AlbumSectionEntityTypeSchema = z.enum([
  "TEAM",
  "NATIONAL_TEAM",
  "INTRO",
  "TOURNAMENT",
  "PLAYER_CATEGORY",
  "SPECIAL",
  "OTHER",
]);
export type AlbumSectionEntityType = z.infer<typeof AlbumSectionEntityTypeSchema>;

export const AlbumSectionSchema = z.object({
  id: z.string(),
  title: LocalizedTextSchema,
  subtitle: LocalizedTextSchema.optional(),
  order: z.number().int(),
  entityType: AlbumSectionEntityTypeSchema,
  badge: z.string().optional(),
  group: z.string().optional(),
  primaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  flag: z.string().optional(),
  imageAsset: z.string().optional(),
  items: z.array(CollectibleItemSchema),
});
export type AlbumSection = z.infer<typeof AlbumSectionSchema>;

export const SpecialCollectionSchema = z.object({
  id: z.string(),
  title: LocalizedTextSchema,
  description: LocalizedTextSchema.optional(),
  countsTowardAlbumCompletion: z.boolean(),
  primaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  icon: z.string().optional(),
  imageAsset: z.string().optional(),
  items: z.array(CollectibleItemSchema),
});
export type SpecialCollection = z.infer<typeof SpecialCollectionSchema>;

/* ── Album + family ───────────────────────────────────────────────────────── */

export const RegionSchema = z.enum(["GLOBAL", "ISRAEL", "EUROPE", "OTHER"]);
export type Region = z.infer<typeof RegionSchema>;

export const ItemTypeSchema = z.enum(["STICKER", "CARD", "MIXED"]);
export type ItemType = z.infer<typeof ItemTypeSchema>;

/**
 * Layout hint for the album renderer.
 * - `world-cup-grouped`: WC-style with groups (A–L), 4 teams per group.
 * - `team-grid`: flat grid of teams.
 * - `flat-sections`: vertical list of sections — Supergol / Football Stars / generic.
 * - `metadata-only`: no checklist — placeholder view.
 */
export const AlbumLayoutSchema = z.enum([
  "world-cup-grouped",
  "world-cup-flat-grouped",
  "team-grid",
  "flat-sections",
  "metadata-only",
]);
export type AlbumLayout = z.infer<typeof AlbumLayoutSchema>;

export const AlbumEditionSchema = z.object({
  id: z.string(),
  albumId: z.string(),
  market: z.string(),
  language: z.string().optional(),
  editionName: LocalizedTextSchema.optional(),
  baseItemCount: z.number().int().nonnegative(),
  numberingVariant: z.string().optional(),
  isDefault: z.boolean(),
  sources: z.array(ChecklistSourceSchema).default([]),
});
export type AlbumEdition = z.infer<typeof AlbumEditionSchema>;

export const AlbumSchema = z.object({
  id: z.string(),
  slug: z.string(),
  familyId: z.string(),
  title: LocalizedTextSchema,
  shortTitle: LocalizedTextSchema.optional(),
  season: z.string().optional(),
  year: z.number().int().optional(),
  publisher: z.string().optional(),
  country: z.string().optional(),
  itemType: ItemTypeSchema,
  dataStatus: AlbumDataStatusSchema,
  totalItems: z.number().int().optional(),
  layout: AlbumLayoutSchema,
  sections: z.array(AlbumSectionSchema).default([]),
  specialCollections: z.array(SpecialCollectionSchema).default([]),
  theme: CollectionThemeSchema,
  sourceNotes: z.array(z.string()).optional(),
  sources: z.array(ChecklistSourceSchema).optional(),
  verification: ChecklistVerificationSchema.optional(),
  coverAsset: z.string().optional(),
  releasedAt: z.string().optional(),
  editions: z.array(AlbumEditionSchema).optional(),
});
export type Album = z.infer<typeof AlbumSchema>;

export const CollectionFamilySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: LocalizedTextSchema,
  description: LocalizedTextSchema.optional(),
  publisher: z.string().optional(),
  region: RegionSchema.optional(),
  logoAsset: z.string().optional(),
  theme: CollectionThemeSchema,
});
export type CollectionFamily = z.infer<typeof CollectionFamilySchema>;

/* ── Validation helpers ───────────────────────────────────────────────────── */

export type AlbumValidationResult =
  | { ok: true; album: Album }
  | { ok: false; albumId?: string; error: string };

export function validateAlbum(input: unknown): AlbumValidationResult {
  const parsed = AlbumSchema.safeParse(input);
  if (!parsed.success) {
    const id =
      input && typeof input === "object" && "id" in input
        ? String((input as { id: unknown }).id)
        : undefined;
    return { ok: false, albumId: id, error: parsed.error.issues.map((i) => i.message).join("; ") };
  }
  const album = parsed.data;

  // Code uniqueness within an album.
  const codes = new Set<string>();
  for (const section of album.sections) {
    for (const item of section.items) {
      if (codes.has(item.code)) {
        return {
          ok: false,
          albumId: album.id,
          error: `Duplicate code ${item.code} in album ${album.id}`,
        };
      }
      codes.add(item.code);
    }
  }
  for (const special of album.specialCollections ?? []) {
    for (const item of special.items) {
      if (codes.has(item.code)) {
        return {
          ok: false,
          albumId: album.id,
          error: `Duplicate code ${item.code} in album ${album.id}`,
        };
      }
      codes.add(item.code);
    }
  }

  // Status-aware invariants.
  const totalItemCount = album.sections.reduce((acc, s) => acc + s.items.length, 0);
  const requiredCount =
    album.sections.reduce(
      (acc, s) => acc + s.items.filter((i) => i.isRequiredForCompletion).length,
      0
    ) +
    (album.specialCollections ?? []).reduce(
      (acc, sp) =>
        acc +
        (sp.countsTowardAlbumCompletion
          ? sp.items.filter((i) => i.isRequiredForCompletion).length
          : 0),
      0
    );

  const status = album.verification?.status ?? album.dataStatus;
  if (album.verification && album.verification.status !== album.dataStatus) {
    return {
      ok: false,
      albumId: album.id,
      error: `dataStatus (${album.dataStatus}) does not match verification.status (${album.verification.status}) for ${album.id}`,
    };
  }

  if (status === "metadata-only" && totalItemCount > 0) {
    return {
      ok: false,
      albumId: album.id,
      error: `metadata-only album ${album.id} must not contain checklist items`,
    };
  }
  if (status === "verified-complete") {
    if (totalItemCount === 0) {
      return {
        ok: false,
        albumId: album.id,
        error: `verified-complete album ${album.id} must contain at least one item`,
      };
    }
    const sources = album.verification?.sources ?? album.sources ?? [];
    if (sources.length === 0) {
      return {
        ok: false,
        albumId: album.id,
        error: `verified-complete album ${album.id} must declare at least one source`,
      };
    }
    if (album.totalItems !== undefined && album.totalItems !== requiredCount) {
      return {
        ok: false,
        albumId: album.id,
        error: `verified-complete album ${album.id}: totalItems=${album.totalItems} does not match required-item count ${requiredCount}`,
      };
    }
  }

  if (album.editions && album.editions.length > 0) {
    const defaults = album.editions.filter((e) => e.isDefault);
    if (defaults.length !== 1) {
      return {
        ok: false,
        albumId: album.id,
        error: `album ${album.id} must declare exactly one default edition (found ${defaults.length})`,
      };
    }
    const editionIds = new Set<string>();
    for (const e of album.editions) {
      if (editionIds.has(e.id)) {
        return {
          ok: false,
          albumId: album.id,
          error: `duplicate edition id ${e.id} in album ${album.id}`,
        };
      }
      editionIds.add(e.id);
      if (e.albumId !== album.id) {
        return {
          ok: false,
          albumId: album.id,
          error: `edition ${e.id} declares albumId=${e.albumId}, expected ${album.id}`,
        };
      }
    }
  }

  return { ok: true, album };
}
