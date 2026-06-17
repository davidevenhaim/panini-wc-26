import { z } from "zod";

export const DATA_ISSUE_TYPES = [
  "WRONG_PLAYER_NAME",
  "WRONG_TEAM",
  "WRONG_STICKER_NUMBER",
  "WRONG_SECTION",
  "MISSING_STICKER",
  "EXTRA_STICKER",
  "WRONG_TOTAL",
  "WRONG_ORDER",
  "WRONG_TRANSLATION",
  "WRONG_SPECIAL_STATUS",
  "OTHER",
] as const;

export const DataIssueTypeSchema = z.enum(DATA_ISSUE_TYPES);
export type DataIssueType = z.infer<typeof DataIssueTypeSchema>;

export const ReportStatusSchema = z.enum([
  "OPEN",
  "REVIEWING",
  "ACCEPTED",
  "REJECTED",
  "DUPLICATE",
]);
export type ReportStatus = z.infer<typeof ReportStatusSchema>;

// Coerce empty strings to undefined for optional inputs so the form's
// "" default values pass schema validation cleanly.
const emptyToUndefined = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

const optionalShortText = z.preprocess(emptyToUndefined, z.string().trim().max(500).optional());

const optionalHttpsUrl = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .trim()
    .max(500)
    .regex(/^https?:\/\/\S{4,}$/i, "invalid url")
    .optional()
);

export const ReportPayloadSchema = z.object({
  albumId: z.string().min(1).max(120),
  editionId: z.string().min(1).max(120).optional(),
  sectionId: z.string().min(1).max(120).optional(),
  itemCode: z.string().min(1).max(120).optional(),
  issueType: DataIssueTypeSchema,
  description: z.string().trim().min(4, "too short").max(2000, "too long"),
  suggestedValue: optionalShortText,
  sourceUrl: optionalHttpsUrl,
});
export type ReportPayload = z.infer<typeof ReportPayloadSchema>;

export type AlbumDataReport = {
  id: string;
  userId?: string;
  albumId: string;
  editionId?: string;
  sectionId?: string;
  itemCode?: string;
  issueType: DataIssueType;
  description: string;
  suggestedValue?: string;
  sourceUrl?: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
};

/**
 * Context the caller carries from the UI surface where the report is
 * triggered. Stored alongside the report so reviewers see the same view as
 * the reporter without extra lookups.
 */
export type ReportContext = {
  albumId: string;
  albumTitle?: string;
  editionId?: string;
  sectionId?: string;
  sectionTitle?: string;
  itemCode?: string;
  itemTitle?: string;
  /** Sticker album vs card album — drives the user-facing label. */
  itemType?: "STICKER" | "CARD" | "MIXED";
};
