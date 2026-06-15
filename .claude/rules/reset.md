# Resetting the Skeleton — Removing Demo Files

This guide tells you exactly what to delete, what to modify, and what to keep when stripping the demo content and starting your own product from scratch.

The skeleton ships with a live demo (`/demo/*`), a contact feature, and a demo landing page at `/demo/landing` — all as working examples. None of that is infrastructure. All of it is safe to remove.

---

## What Is Demo vs. Infrastructure

**Infrastructure (keep):** UI components, form system, hooks, utils, stores, i18n setup, API proxy, layout shell, error/not-found pages, types, constants skeleton, root page hero images, **Supabase clients + middleware + auth-supabase feature + login/signup pages**.

**Demo (delete):** Everything under `/demo`, the contact feature, the demo landing route under `/demo/landing`, demo components, demo constants, demo translation keys, demo test, the `todos` example feature + page, orphaned public assets, and homepage links that point back to the demo/showcase.

---

## Step 1 — Delete Directories and Files

Run these deletions. Each one is safe — nothing in the infrastructure imports from these paths.

### Entire directories

```
src/app/demo/
src/app/contact/
src/app/todos/
src/app/api/proxy/contact/
src/components/demo/
src/components/marketing/
src/features/contact/
src/features/landing-page/
src/features/todos/
```

### Individual files

```
src/constants/demo-tabs.constants.ts
src/constants/guide-sections.constants.ts
src/constants/landing-media.constants.ts
src/__tests__/contact.schema.test.ts
public/lottie/lottie-demo.json
public/file.svg
public/globe.svg
public/next.svg
public/vercel.svg
public/window.svg
```

### Hero images — replace, do not delete

`public/landing-page/globe.png` and `public/landing-page/globe-light.png` are used by `src/app/page.tsx` as the root page hero background. Do not delete them. Replace them with your own images when you are ready.

---

## Step 2 — Root Page

**Do not delete `src/app/page.tsx`.** Keep the root hero page and the theme/language controls, but remove demo-facing action buttons:

- remove the GitHub project button and its `GITHUB_URL` import
- remove the showcase button and its `WEB_ROUTES.DEMO_GUIDE` link
- remove unused imports (`Link`, `Button`, `Iconify`, route constants, and app constants)

After the reset, `src/app/page.tsx` should look like this:

```tsx
import { useTranslations } from "next-intl";
import { LocaleDialog } from "@/components/app";
import { HeroWithBackgroundImage } from "@/components/ui/hero-with-background-image";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Typography } from "@/components/ui/typography";

export default function RootPage() {
  const t = useTranslations();

  return (
    <HeroWithBackgroundImage
      backgroundImageSrc="/landing-page/globe.png"
      backgroundImageSrcLight="/landing-page/globe-light.png"
      backgroundImageAlt=""
      imagePosition="center 75%"
      contentClassName="mx-auto max-w-4xl"
    >
      <div className="flex flex-col items-center gap-6">
        <Typography variant="h1" className="text-center text-4xl font-bold md:text-6xl">
          {t("home.startHere")}
        </Typography>
        <div className="flex items-center justify-center gap-2">
          <ThemeToggle className="bg-background/80 border-border/60 border shadow-sm backdrop-blur" />
          <LocaleDialog />
        </div>
      </div>
    </HeroWithBackgroundImage>
  );
}
```

---

## Step 3 — Clean Up Route Constants

`src/constants/web-routes.constants.ts` — remove all `DEMO_*`, `CONTACT`, and `TODOS` keys. Keep auth routes:

```ts
const WEB_ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  AUTH_CALLBACK: "/auth/callback",
  // add your own routes here
} as const;

export default WEB_ROUTES;
```

`src/constants/api-routes.constants.ts` — remove `CONTACT`. Keep `AUTH` and `USERS` as examples, or replace them with your own:

```ts
const API_ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
  },
  // add your own routes here
} as const;

export default API_ROUTES;
```

`src/constants/app.constants.ts` — remove `GITHUB_URL` if it is only used by the demo/homepage GitHub button. Keep other infrastructure constants:

```ts
export const DEFAULT_REFRESH_INTERVAL = 1500;
```

---

## Step 4 — Clean Up Translation Files

Edit all four locale files: `messages/en.json`, `messages/he.json`, `messages/es.json`, `messages/ar.json`.

**Remove these top-level keys:**

| Key                 | Why it's demo            |
| ------------------- | ------------------------ |
| `demo`              | entire demo UI namespace |
| `contact`           | contact feature          |
| `todos`             | todos example feature    |
| `tabGuide`          | demo tab label           |
| `tabDashboard`      | demo tab label           |
| `tabForms`          | demo tab label           |
| `tabDialogs`        | demo tab label           |
| `tabView`           | demo tab label           |
| `tabTokenUsage`     | demo tab label           |
| `tabTechnicalGuide` | demo tab label           |
| `tabLanding`        | demo tab label           |

**Keep these** — they are infrastructure used by shared components:

| Key                | Used by                                                                                             |
| ------------------ | --------------------------------------------------------------------------------------------------- |
| `home`             | `src/app/page.tsx` root page                                                                        |
| `forms`            | form validation error messages (form field components)                                              |
| `authSupabase`     | login / signup / logout UI (kept as infrastructure)                                                 |
| `errorBoundary`    | `src/app/error.tsx`                                                                                 |
| `notFound`         | `src/app/not-found.tsx`                                                                             |
| All shared UI keys | (`select`, `search`, `save`, `cancel`, `loading`, theme keys, language keys, pagination keys, etc.) |

Inside `home`, keep `startHere`. Remove `githubProject` and `showcasePage` because they belong to the demo-facing homepage buttons removed in Step 2.

After editing, keep all four locale files in sync — same keys present in all of them.

---

## Step 5 — Clear Cache and Verify

**Always delete the Next.js cache after the reset** — stale cached routes will cause redirects and broken pages even after files are deleted.

```bash
rm -rf .next
pnpm build        # no import errors
pnpm test         # src/__tests__/utils.test.ts should still pass
```

If the build fails, search for broken imports and leftover demo homepage links:

```bash
rg "demo-tabs|guide-sections|landing-media|features/contact|features/landing|components/demo|components/marketing|WEB_ROUTES\.DEMO|WEB_ROUTES\.CONTACT|API_ROUTES\.CONTACT|GITHUB_URL|home\.githubProject|home\.showcasePage" src messages
```

Fix any remaining imports, then run `pnpm build` again.

---

## What You Have After the Reset

All of this is still intact and ready to use:

| Area                        | Path                                                                             |
| --------------------------- | -------------------------------------------------------------------------------- |
| Root page (hero)            | `src/app/page.tsx` — edit to build your home page                                |
| UI component library        | `src/components/ui/`                                                             |
| Form system                 | `src/components/form/`                                                           |
| App shell components        | `src/components/app/`                                                            |
| All hooks                   | `src/hooks/`                                                                     |
| All utilities               | `src/utils/`                                                                     |
| Zustand stores              | `src/store/`                                                                     |
| API client + toast + config | `src/lib/`                                                                       |
| Shared types                | `src/types/`                                                                     |
| i18n setup                  | `src/i18n/`                                                                      |
| API proxy route             | `src/app/api/proxy/[...path]/route.ts`                                           |
| Global layout               | `src/app/layout.tsx`                                                             |
| Error page                  | `src/app/error.tsx`                                                              |
| Not-found page              | `src/app/not-found.tsx`                                                          |
| Route group pattern         | `src/app/(auth)/`, `src/app/(dashboard)/` — create as needed                     |
| Constants skeleton          | `src/constants/web-routes.constants.ts`, `src/constants/api-routes.constants.ts` |
| Test setup                  | `src/test/setup.ts`, `src/__tests__/utils.test.ts`                               |
| Hero images                 | `public/landing-page/` — replace with your own images                            |

---

## Starting Your First Real Feature

After the reset, the typical first steps are:

1. Add your route groups: `src/app/(auth)/` and `src/app/(dashboard)/` with their `layout.tsx` files
2. Add your first page under the appropriate group
3. Register its path in `WEB_ROUTES`
4. Add its API endpoints in `API_ROUTES` if needed
5. Add translation keys to all locale files
6. Build UI using `src/components/ui/` and `src/components/form/`

Follow `CLAUDE.md` conventions for all new code — they still apply fully after the reset.
