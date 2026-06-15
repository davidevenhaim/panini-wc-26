# Stores and State Management Rules

## The Two Stores

The project has exactly two Zustand stores:

| Store            | File                        | Purpose                   |
| ---------------- | --------------------------- | ------------------------- |
| `useLoaderStore` | `src/store/loader.store.ts` | global HTTP loading state |
| `useThemeStore`  | `src/store/theme.store.ts`  | light/dark theme          |

**Auth state is not a Zustand store.** It lives in Supabase cookies and is read via `createClient()` (server) or `usePermissions()` (client). See `.claude/rules/auth.md`.

## Rules

Do not create a new Zustand store unless state needs to be shared across components that do not share a common parent.

If state is local to a component or a subtree, use `useState` or `useReducer`.

Do not put server-fetched data into a store — use `useFetch` (SWR handles caching).

## Reading Auth State

Auth state is not stored here. See `.claude/rules/auth.md`.

- Server: `const supabase = await createClient(); const { data } = await supabase.auth.getUser();`
- Client: `const { user, isAuthenticated } = usePermissions();`

## Using the Loader Store

The loader store is wired to the axios interceptors automatically. You do not need to call `add`/`remove` manually for standard API requests.

Only call it directly for non-axios async operations:

```ts
const { add, remove } = useLoaderStore();
add("exportPdf");
// ... async work
remove("exportPdf");
```

Check loading state in UI with `useIsLoading()` (any request) or `useIsLoading("exportPdf")` (specific key).

## Adding to a Store

Only add a field to an existing store when:

- the data is genuinely global (not page-local)
- multiple unrelated components need to read or write it
- the state does not belong in URL query params, form state, or local `useState`
