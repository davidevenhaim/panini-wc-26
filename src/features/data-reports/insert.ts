import type { SupabaseClient } from "@supabase/supabase-js";
import { ReportPayloadSchema, type ReportPayload } from "./types";

export class DataReportInsertError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DataReportInsertError";
  }
}

export async function insertDataReport(
  supabase: SupabaseClient,
  userId: string,
  payload: ReportPayload
): Promise<string> {
  // Re-validate at the boundary — client may have skipped (e.g. anonymous
  // submitters) or the form schema may diverge in future.
  const parsed = ReportPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    throw new DataReportInsertError(parsed.error.issues.map((i) => i.message).join("; "));
  }
  const p = parsed.data;

  const { data, error } = await supabase
    .from("album_data_reports")
    .insert({
      user_id: userId,
      album_id: p.albumId,
      edition_id: p.editionId ?? null,
      section_id: p.sectionId ?? null,
      item_code: p.itemCode ?? null,
      issue_type: p.issueType,
      description: p.description,
      suggested_value: p.suggestedValue ?? null,
      source_url: p.sourceUrl ?? null,
    })
    .select("id")
    .single();
  if (error) throw new DataReportInsertError(error.message);
  return data.id as string;
}

/**
 * Server-only — lists open reports for an admin screen. Uses the supplied
 * client; pass a service-role client in admin contexts. RLS prevents
 * ordinary users from reading other people's reports.
 */
export async function listOpenReportsForAlbum(
  supabase: SupabaseClient,
  albumId: string,
  limit = 100
) {
  const { data, error } = await supabase
    .from("album_data_reports")
    .select("*")
    .eq("album_id", albumId)
    .eq("status", "OPEN")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
