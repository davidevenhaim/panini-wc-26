"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { CONFIG } from "@/lib/app-config";
import WEB_ROUTES from "@/constants/web-routes.constants";

export type AuthActionResult = { error?: string };

export async function loginAction(
  _prev: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  if (!CONFIG.isSupabaseConfigured) return { error: "supabaseNotConfigured" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect(WEB_ROUTES.HOME);
}

export async function signupAction(
  _prev: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  if (!CONFIG.isSupabaseConfigured) return { error: "supabaseNotConfigured" };

  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? CONFIG.webUrl;

  const { error } = await supabase.auth.signUp({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect(WEB_ROUTES.HOME);
}

export async function logoutAction(): Promise<void> {
  if (!CONFIG.isSupabaseConfigured) {
    redirect(WEB_ROUTES.HOME);
  }
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect(WEB_ROUTES.HOME);
}

export async function signInWithGoogleAction(): Promise<AuthActionResult> {
  if (!CONFIG.isSupabaseConfigured) return { error: "supabaseNotConfigured" };

  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? CONFIG.webUrl;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback` },
  });

  if (error) return { error: error.message };
  if (data?.url) redirect(data.url);
  return {};
}
