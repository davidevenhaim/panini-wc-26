"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CONFIG } from "@/lib/app-config";
import WEB_ROUTES from "@/constants/web-routes.constants";

export async function addTodoAction(formData: FormData): Promise<{ error?: string }> {
  if (!CONFIG.isSupabaseConfigured) return { error: "supabaseNotConfigured" };

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "notAuthenticated" };

  const text = String(formData.get("text") ?? "").trim();
  if (!text) return { error: "textRequired" };

  const { error } = await supabase
    .from("todos")
    .insert({ text, user_id: userData.user.id, done: false });

  if (error) return { error: error.message };

  revalidatePath(WEB_ROUTES.TODOS);
  return {};
}

export async function toggleTodoAction(id: string, done: boolean): Promise<{ error?: string }> {
  if (!CONFIG.isSupabaseConfigured) return { error: "supabaseNotConfigured" };

  const supabase = await createClient();
  const { error } = await supabase.from("todos").update({ done }).eq("id", id);

  if (error) return { error: error.message };
  revalidatePath(WEB_ROUTES.TODOS);
  return {};
}

export async function deleteTodoAction(id: string): Promise<{ error?: string }> {
  if (!CONFIG.isSupabaseConfigured) return { error: "supabaseNotConfigured" };

  const supabase = await createClient();
  const { error } = await supabase.from("todos").delete().eq("id", id);

  if (error) return { error: error.message };
  revalidatePath(WEB_ROUTES.TODOS);
  return {};
}
