import { useState } from "react";
import { type SWRConfiguration } from "swr";
import { useFetch, type UseFetchReturn } from "@/hooks/use-fetch";

// ----------------------------------------------------------------------

export type UsePaginatedFetchReturn<T> = UseFetchReturn<T> & {
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
};

/**
 * GET hook with built-in pagination state. Wraps `useFetch`.
 * Appends `?page=N&pageSize=N` to the URL automatically.
 * Pass `null` as `baseUrl` to skip fetching (conditional fetching).
 *
 * @example
 * const { data, isLoading, page, nextPage, prevPage } =
 *   usePaginatedFetch<Paginated<User>>(API_ROUTES.USERS.LIST);
 */
export function usePaginatedFetch<T>(
  baseUrl: string | null,
  initialPageSize = 20,
  config?: SWRConfiguration<T>
): UsePaginatedFetchReturn<T> {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const url = baseUrl ? `${baseUrl}?page=${page}&pageSize=${pageSize}` : null;
  const result = useFetch<T>(url, config);

  return {
    ...result,
    page,
    pageSize,
    setPage,
    setPageSize,
    nextPage: () => setPage((p) => p + 1),
    prevPage: () => setPage((p) => Math.max(1, p - 1)),
  };
}
