import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next 16 renamed the `middleware.ts` convention to `proxy.ts`.
// This runs on every matching request — we use it to refresh the Supabase
// auth cookie so server reads see the latest session.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, public files
     * - /api/proxy (custom backend proxy — no session refresh needed)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/proxy|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
