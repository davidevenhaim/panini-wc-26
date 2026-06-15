# Testing Rules

## Stack

- **Test runner:** Vitest (`pnpm test` / `pnpm test:watch`)
- **Assertions:** `@testing-library/jest-dom` (auto-imported via `src/test/setup.ts`)
- **DOM:** jsdom (configured in `vitest.config.ts`)
- **Component tests:** `@testing-library/react`

## Where to Put Tests

| Type                               | Location                                                                              |
| ---------------------------------- | ------------------------------------------------------------------------------------- |
| Unit tests (utils, schemas, hooks) | `src/__tests__/`                                                                      |
| Component tests                    | Co-located as `Component.test.tsx` next to the component file, or in `src/__tests__/` |
| Integration tests                  | `src/__tests__/`                                                                      |

## Component Render Wrapper

Components that use translations, theme, or direction context need a provider wrapper. Create a shared helper:

```tsx
// src/__tests__/setup/test-utils.tsx
import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/../messages/en.json";

export function renderWithProviders(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
}
```

## Prefer Accessible Queries

Use `screen.getByRole`, `screen.getByLabelText`, `screen.getByText` over `getByTestId`. Tests that use accessible queries also verify accessibility:

```ts
// Good
screen.getByRole("button", { name: /submit/i });
screen.getByLabelText(/email/i);

// Avoid
screen.getByTestId("submit-btn");
```

## Mocking API Calls

Mock `@/lib/api-client` for component and hook tests that trigger requests:

```ts
vi.mock("@/lib/api-client", () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({ data: { items: [] } }),
    post: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
}));
```

## Schema Tests (Zod)

Test the Zod schema directly with `safeParse`. Use the existing `src/__tests__/contact.schema.test.ts` as a reference:

```ts
import { contactSchema } from "@/features/contact/validation/contact.schema";

it("rejects empty email", () => {
  const result = contactSchema.safeParse({ email: "", message: "hello" });
  expect(result.success).toBe(false);
});
```

## What to Test

- **Zod schemas** — valid and invalid input shapes
- **Utility functions** — all branches of utils (see `src/__tests__/utils.test.ts`)
- **Hooks** — state transitions (use `@testing-library/react` `renderHook`)
- **Critical form components** — that the right error message appears on invalid submit
- **Store behavior** — that `setUser`, `logout`, etc. produce the right state

## What Not to Test

- Implementation details (internal state variable names, exact DOM structure)
- Styling or className presence
- Third-party library behavior (Radix, SWR, Zustand internals)
- One-off demo components

## Running Tests

```bash
pnpm test           # run once
pnpm test:watch     # watch mode
pnpm test:coverage  # generate coverage report
```
