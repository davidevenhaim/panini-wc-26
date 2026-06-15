# Auth Rules

Auth is powered by **Supabase Auth** via the `@supabase/ssr` package. Sessions are stored in **HTTP-only cookies** and refreshed by Next.js middleware on every request.

There is **no Zustand auth store**. Read the session via Supabase clients (server) or `usePermissions()` (client).

## Where things live

| File                                     | Purpose                                                                        |
| ---------------------------------------- | ------------------------------------------------------------------------------ |
| `src/lib/supabase/client.ts`             | Browser Supabase client (Client Components)                                    |
| `src/lib/supabase/server.ts`             | Server Supabase client (RSC, Route Handlers, Server Actions)                   |
| `src/lib/supabase/middleware.ts`         | Session refresh helper used by `src/proxy.ts`                                  |
| `src/proxy.ts`                           | Refreshes the auth cookie on every matching request (Next 16 proxy convention) |
| `src/features/auth-supabase/`            | Login, signup, logout, Google OAuth UI + Server Actions                        |
| `src/app/(auth)/login`, `signup`         | Public auth pages (group layout)                                               |
| `src/app/auth/callback/route.ts`         | OAuth code-exchange endpoint                                                   |
| `src/hooks/use-permissions.ts`           | Reactive auth state for Client Components                                      |
| `src/components/app/permission-gate.tsx` | `<PermissionGate>` — renders children only when authenticated                  |

## Configuration

The app boots fine without Supabase keys — auth UI shows a friendly "not configured" notice. To enable auth, set both in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Check `CONFIG.isSupabaseConfigured` from `@/lib/app-config` when you need to branch on whether keys are present.

## Reading the user on the server (preferred)

In Server Components, Route Handlers, and Server Actions:

```ts
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import WEB_ROUTES from "@/constants/web-routes.constants";

const supabase = await createClient();
const { data } = await supabase.auth.getUser();
if (!data.user) redirect(WEB_ROUTES.LOGIN);
```

Always trust `getUser()` on the server — it verifies the JWT. Do not trust `getSession()` on the server.

## Reading the user on the client

```ts
const { user, isAuthenticated, isLoading } = usePermissions();
if (isLoading) return null;
if (!isAuthenticated) return <LoginPrompt />;
```

`usePermissions()` subscribes to `onAuthStateChange`, so it stays in sync after login/logout without a refresh.

## Login / signup / logout

Use the Server Actions exported from `src/features/auth-supabase/actions.ts`:

- `loginAction(prev, formData)` — email + password
- `signupAction(prev, formData)` — email + password (sends verification email)
- `signInWithGoogleAction()` — redirects to Google OAuth, then to `/auth/callback`
- `logoutAction()` — clears the session cookie

The shipped `LoginForm`, `SignupForm`, `GoogleButton`, `LogoutButton` wrap these — reuse them before writing your own.

## Adding role-based authorization

`usePermissions()` is intentionally minimal — it returns `{ user, isAuthenticated, isLoading }`. To add roles:

1. Store the role in Supabase: set `user.app_metadata.role` from a server-side admin action (never from the client; `user_metadata` is user-editable and not safe for authz).
2. Read it in `use-permissions.ts`:
   ```ts
   const role = (user?.app_metadata?.role as string | undefined) ?? "user";
   ```
3. Expose `role`, `isAdmin`, `hasRole(required)` from the hook.
4. Update `PermissionGate` to accept a `roles` prop and gate on `hasRole`.
5. **Authorize on the server too** — Row Level Security policies in Supabase are the real fence. Client-side gates only hide UI.

## Route protection

Protect Server Component pages by checking the user at the top of the page and redirecting:

```tsx
const supabase = await createClient();
const { data } = await supabase.auth.getUser();
if (!data.user) redirect(WEB_ROUTES.LOGIN);
```

For broader request-level protection, extend `src/proxy.ts` to redirect unauthenticated users away from protected paths. The session refresh logic in `src/lib/supabase/middleware.ts` is the right place to add that check.

## Row Level Security

Every Supabase table should have RLS enabled. The `todos` example uses:

```sql
alter table todos enable row level security;
create policy "own rows" on todos for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

This is what actually prevents user A from reading user B's rows — not your application code.
