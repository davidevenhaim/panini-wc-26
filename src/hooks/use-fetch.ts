import useSWR, { type SWRConfiguration } from "swr";
import { fetcher } from "@/lib/swr-client";

// ----------------------------------------------------------------------

export type UseFetchReturn<T> = {
  data: T | undefined;
  isLoading: boolean;
  error: Error | undefined;
  /** Revalidate / refetch data manually */
  mutate: () => void;
};

/**
 * GET data hook powered by SWR.
 * Pass `null` as `url` to skip fetching (conditional fetching).
 *
 * @example
 * const { data, isLoading, error } = useFetch<User[]>("/users");
 * const { data } = useFetch<User>(isReady ? `/users/${id}` : null);
 */
export function useFetch<T>(url: string | null, config?: SWRConfiguration<T>): UseFetchReturn<T> {
  const { fetcher: fetcherOverride, ...swrConfig } = config ?? {};
  const resolvedFetcher = fetcherOverride ?? fetcher;

  const { data, isLoading, isValidating, error, mutate } = useSWR<T>(url, resolvedFetcher, {
    revalidateOnFocus: false,
    ...swrConfig,
  });

  return {
    data,
    isLoading: isLoading || isValidating,
    error,
    mutate: () => void mutate(),
  };
}
