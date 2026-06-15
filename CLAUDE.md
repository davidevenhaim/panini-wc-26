# Skeleton App — Core AI Guide

This project is a reusable Next.js skeleton template intended for other developers to use as a starting point.

The goal is to help users build features quickly while preserving strong conventions, maintainability, and predictable project structure.

Always prefer existing project patterns over inventing new ones.

---

## Project Goal

This skeleton is designed to provide:

- a clean and scalable structure
- reusable UI and form patterns
- safe data fetching and mutation patterns
- built-in i18n support
- consistent state, routing, and configuration handling
- conventions that work well for both human developers and AI coding tools

Do not introduce unnecessary abstraction or custom patterns when an existing project convention already solves the problem.

---

## Core Rules

1. Always use `@/` imports. Never use long relative imports like `../../..`.

2. Never hardcode user-visible strings in JSX. Always use translations.

3. Never call `fetch`, `axios.get`, or `axios.post/put/delete` directly inside components.
   - Use `useFetch` for reads
   - Use `useMutation` for writes

4. Never hardcode API route strings or web route strings inside components.
   - Use route constants

5. Never use raw HTML form inputs for app forms unless there is a very clear reason.
   - Use the project form system and shared form components

6. Never read `process.env` directly inside components or hooks.
   - Use the typed `CONFIG` object

7. Never use `localStorage` directly.
   - Use the storage helpers / hooks

8. Prefer existing hooks and utilities before creating new logic.

9. Prefer small, safe, composable changes over large rewrites.

10. Keep UI consistent with the skeleton’s shared patterns.
    - reuse page wrappers
    - reuse form components
    - reuse dialog patterns
    - reuse table / filter patterns

11. Never call `toast()` directly inside components.
    - Use the shared helpers: `toastSuccess`, `toastError`, `toastWarning`, `toastInfo`, `toastPromise`
    - These live in `src/lib/toast.ts`

12. Never add new fields to a Zustand store unless the data needs to be shared across unrelated components.
    - Read `.claude/rules/stores.md` before touching any store

13. Never use a raw `<button>` element in JSX.
    - Always use `<Button>` from `@/components/ui/button`
    - For inline/unstyled triggers use `variant="ghost"` or `size="none"` with className overrides
    - Exception: inside class components that cannot import hooks — wrap in a functional sub-component instead

14. Never use raw HTML text elements (`<p>`, `<h1>`–`<h6>`, `<span>` for text) in JSX.
    - Always use `<Typography>` from `@/components/ui/typography`
    - Pick the closest semantic variant (`h1`–`h6`, `subtitle1/2`, `body1/2`, `caption1/2`, `label1/2`, `overline`)

15. Authentication is Supabase, not a custom store.
    - Server: `await createClient()` from `@/lib/supabase/server`
    - Client: `usePermissions()` from `@/hooks`
    - UI/components: reuse `src/features/auth-supabase/` (LoginForm, SignupForm, GoogleButton, LogoutButton)
    - Every Supabase table must have RLS enabled — see `.claude/rules/auth.md`

---

## Workflow Rules

- Before creating a new helper, hook, or component, first check whether an existing one already exists.
- Before introducing a new pattern, inspect nearby files and follow the established structure.
- Keep code understandable for developers who may not know the stack deeply.
- Favor readability and maintainability over cleverness.
- When changing existing code, preserve behavior unless change is explicitly requested.
- When adding new user-facing text, update all locale files consistently.

---

## Preferred Architecture

- App routes belong in `src/app`
- Shared components belong in `src/components`
- Reusable hooks belong in `src/hooks`
- Pure utilities belong in `src/utils`
- Global stores belong in `src/store`
- Constants belong in `src/constants`
- Shared types belong in `src/types`
- i18n configuration belongs in `src/i18n`
- Translation messages belong in `messages/`
- App-level library code (API client, toast helpers, config) belongs in `src/lib`

### Route Groups (Next.js App Router)

Use route groups to share layouts without affecting URL paths. The folder name in parentheses is excluded from the URL:

- `src/app/(auth)/` — pages that share an auth layout (login, signup, reset password). URL: `/login`, `/signup`
- `src/app/(dashboard)/` — protected pages that share the main app shell. URL: `/dashboard`, `/settings`

Each group gets its own `layout.tsx`. The root `src/app/layout.tsx` stays as the global shell (fonts, providers, theme).

---

## Rules by Topic

Detailed rules are split into focused files under `.claude/rules/`.

Read the relevant rule file when working in these areas:

- forms → `.claude/rules/forms.md`
- data fetching / mutations → `.claude/rules/data-fetching.md`
- translations → `.claude/rules/translations.md`
- routes / config / storage → `.claude/rules/app-structure.md`
- UI / styling / layout → `.claude/rules/ui-patterns.md`
- utilities / hooks → `.claude/rules/hooks-and-utils.md`
- stores / state → `.claude/rules/stores.md`
- error handling → `.claude/rules/error-handling.md`
- auth / permissions → `.claude/rules/auth.md`
- writing tests → `.claude/rules/testing.md`
- component reuse / shared UI patterns → `.claude/rules/component-reuse.md`
- removing demo files / starting fresh → `.claude/rules/reset.md`

---

## Default Behavior

When implementing a new feature:

1. inspect nearby files
2. reuse existing patterns
3. prefer shared components and hooks
4. keep translations and routes centralized
5. avoid one-off solutions unless clearly justified
6. for list views with data, prefer `DataTable` before building a custom table

If unsure, choose the simplest solution that matches the project’s conventions.
