"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

/**
 * Resolves field labels/placeholders that are either translation keys or pre-rendered nodes.
 * Keys with a dot use the `forms` namespace; plain keys use the root namespace.
 */
export function useFieldText() {
  const tForms = useTranslations("forms");
  const tRoot = useTranslations();

  const tr = (key: string) => (key.includes(".") ? tForms(key as never) : tRoot(key as never));

  const render = (value: ReactNode | undefined): ReactNode | undefined => {
    if (value === undefined) return undefined;
    if (typeof value === "string") return tr(value);
    return value;
  };

  return { tr, render };
}
