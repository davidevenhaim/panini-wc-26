# Component Reuse Guide

Use shared primitives before inventing one-off UI.

## App shell

- `PageContainer` — page title, subtitle, optional `actions`, children. Pass header controls via `actions`; never import demo-only components from `src/components/app`.
- `AppDialog`, `ErrorBoundary`, `LocaleDialog`, `ThemeToggle` — app-level wrappers; keep product logic in pages/features.

## Forms

- Wrap with `<Form>` from `@/components/form`.
- Use field components (`TextInput`, `FormSelect`, `FormCombobox`, `FormMultiSelect`, etc.).
- Labels/placeholders: translation keys (`labels.name`) or `ReactNode` via `useFieldText().render()`.
- Searchable select: `FormCombobox` or `FormMultiSelect`, not `FormSelect`.
- Validation: `formValidator` helpers + `formatFormError` (supports `errors.key` and dotted keys).

## Data display

- Lists with sort/search/pagination: `DataTable` with `columns`, `getRowKey`, optional `emptyState`.
- Server pagination: `usePaginatedFetch` + controlled table state in the page.

## Overlays and feedback

- Modals: `AppDialog` or raw `Dialog` primitives.
- Destructive confirm: `AreYouSureDialog`.
- Loading: `LoadingIndicator` with `loadingKey`; avoid global overlay for every read unless intentional.
- Toasts: `toastSuccess` / `toastError` helpers only.

## i18n and RTL

- User-visible strings: `useTranslations()` — never hardcode in shared components.
- Direction: `useDirection()` from `@/components/app`; prefer `start`/`end`, `ps`/`pe`, `text-start`.
- Locale changes: rely on `DirectionProvider` + `LocaleDialog`; do not read `document.dir` once on mount in reusable components.

## Package manager

- Use **pnpm** only: `pnpm install`, `pnpm dev`, `pnpm run ci`.
- `packageManager` in `package.json` pins the version; `preinstall` blocks accidental `npm install`.
