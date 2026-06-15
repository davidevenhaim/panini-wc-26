"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useDebounce } from "@/hooks/use-debounce";
import Iconify from "@/components/ui/iconify";
import { cn } from "@/lib/utils";

// ----------------------------------------------------------------------

export type SearchInputProps = {
  onSearch: (value: string) => void;
  placeholder?: string;
  defaultValue?: string;
  debounceMs?: number;
  /** Shows a spinner at the end of the input (same position as the clear button). */
  loading?: boolean;
  className?: string;
};

/**
 * Search input that debounces `onSearch` calls.
 * Includes a clear button when there is a value.
 *
 * @example
 * <SearchInput onSearch={(q) => setQuery(q)} placeholder="Search..." />
 */
export function SearchInput({
  onSearch,
  placeholder,
  defaultValue = "",
  debounceMs = 300,
  loading = false,
  className,
}: SearchInputProps) {
  const t = useTranslations();
  const [value, setValue] = React.useState(defaultValue);
  const debouncedValue = useDebounce(value, debounceMs);
  const resolvedPlaceholder = placeholder ?? t("search");

  React.useEffect(() => {
    onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);

  return (
    <div className={cn("relative flex items-center", className)}>
      <Iconify
        icon="lucide:search"
        className="text-muted-foreground pointer-events-none absolute start-3 size-4"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={resolvedPlaceholder}
        aria-busy={loading}
        className={cn(
          "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-full rounded-md border bg-transparent py-1 ps-9 pe-8 text-start text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
          (loading || value) && "pe-9"
        )}
      />
      {loading ? (
        <span
          className="text-muted-foreground pointer-events-none absolute end-2 flex size-3.5 items-center justify-center"
          aria-hidden
        >
          <Iconify icon="lucide:loader-2" className="size-3.5 animate-spin" />
        </span>
      ) : (
        value && (
          <button
            type="button"
            onClick={() => setValue("")}
            aria-label={t("clearSearchAria")}
            className="text-muted-foreground hover:text-foreground absolute end-2 flex items-center transition-colors"
          >
            <Iconify icon="lucide:x" className="size-3.5" />
          </button>
        )
      )}
    </div>
  );
}
