import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import WEB_ROUTES from "@/constants/web-routes.constants";

/**
 * OAuth callback handler. Supabase redirects here with a `code` query param;
 * we exchange it for a session and redirect to the requested `next` route.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? WEB_ROUTES.HOME;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}${WEB_ROUTES.LOGIN}?error=oauth`);
}
