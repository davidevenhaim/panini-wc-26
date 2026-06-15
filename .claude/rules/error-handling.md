# Error Handling Rules

## API Errors

The API client (`src/lib/api-client.ts`) intercepts all responses automatically:

- **4xx / 5xx** → `toastError` fires automatically via the response interceptor. Do not call `toastError` again in the same catch block — it will double-toast.
- **401 Unauthorized** → `logout()` is called automatically. The user's auth state clears. Redirect them to a login page if one exists.

## Detecting API Errors

Use `isApiError` from `src/utils/error.utils.ts` to check whether an error came from the API (has a response body and status code) vs. a network failure:

```ts
import { isApiError, parseApiError } from "@/utils/error.utils";

catch (error) {
  if (isApiError(error)) {
    const { message, statusCode } = parseApiError(error);
    // handle specific status codes
  }
}
```

Only use this when you need custom handling beyond the interceptor's default toast. For most cases, the interceptor is enough.

## useMutation Error Handling

`useMutation` from `src/hooks/use-mutation.ts` exposes an `error` field. The interceptor already handles showing a toast — in components, only react to the error if you need to change UI state:

```ts
const { trigger, error, isMutating } = useMutation(API_ROUTES.USERS.BY_ID(id));

// Show inline error state if needed, but don't double-toast:
if (error) return <FieldError message={parseApiError(error).message} />;
```

## Never Swallow Errors Silently

If an error is not shown to the user, at minimum log it in development:

```ts
catch (error) {
  if (process.env.NODE_ENV !== "production") console.error(error);
}
```

## Component Error States

For a component that fetches data and errors, prefer:

1. **SWR error state** — `useFetch` exposes `error`; show an inline message or empty state
2. **Empty state component** — use `<Empty>` from `src/components/ui/empty`
3. **ErrorBoundary** — only for unexpected rendering errors (wraps children automatically via `src/app/layout.tsx`)

Do not show raw error messages from the API to the user unless the message is explicitly safe/user-facing.

## Retry Pattern

Call `trigger` again on user action (a "retry" button):

```ts
const { trigger, isMutating } = useMutation(API_ROUTES.CONTACT.SUBMIT);

<Button onClick={() => trigger({ method: "POST", data })} disabled={isMutating}>
  Retry
</Button>
```

For `useFetch`, use SWR's `mutate` to refetch:

```ts
const { data, error, mutate } = useFetch(API_ROUTES.USERS.LIST);
if (error) return <Button onClick={() => mutate()}>Retry</Button>;
```
