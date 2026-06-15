import axios, { type AxiosInstance, type AxiosError } from "axios";
import { CONFIG } from "@/lib/app-config";
import { clientT } from "@/lib/client-t";

declare module "axios" {
  export interface AxiosRequestConfig {
    /** When true, skips the global axios overlay loader for this request. */
    skipGlobalLoader?: boolean;
  }
}

// ----------------------------------------------------------------------

/**
 * Base URL for the proxy — requests go to our own domain, then the proxy
 * forwards them to the real API. This keeps the real API URL hidden from the
 * client and avoids CORS issues.
 *
 * - Client (browser): uses relative /api/proxy (same-origin)
 * - Server (SSR):     uses full URL from NEXT_PUBLIC_WEB_URL
 */
const getProxyBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    return "/api/proxy";
  }
  return `${CONFIG.webUrl}/api/proxy`;
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: getProxyBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 15000,
});

// ----------------------------------------------------------------------
// Interceptors — wired after creation so they can reference the stores
// lazily (avoids circular-import issues with Zustand stores).

apiClient.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined" && !config.skipGlobalLoader) {
    const { useLoaderStore } = await import("@/store/loader.store");
    useLoaderStore.getState().add("axios");
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    if (typeof window !== "undefined" && !response.config.skipGlobalLoader) {
      import("@/store/loader.store").then(({ useLoaderStore }) => {
        useLoaderStore.getState().remove("axios");
      });
    }
    return response;
  },
  (error: AxiosError<{ message?: string }>) => {
    if (typeof window !== "undefined" && !error.config?.skipGlobalLoader) {
      import("@/store/loader.store").then(({ useLoaderStore }) => {
        useLoaderStore.getState().remove("axios");
      });

      const status = error.response?.status ?? 0;
      const message =
        error.response?.data?.message ?? error.message ?? "An unexpected error occurred";

      if (status === 401) {
        // Supabase manages its own session via cookies + middleware.
        // For this proxied custom-backend client, surface the 401 via toast
        // and let the page handle navigation (e.g. redirect to /login).
        import("@/lib/toast").then(({ toastError }) => {
          toastError(clientT("toastRequestFailed"), message);
        });
      } else if (status >= 400) {
        import("@/lib/toast").then(({ toastError }) => {
          const title = status >= 500 ? clientT("toastServerError") : clientT("toastRequestFailed");
          toastError(title, message);
        });
      }
    }

    return Promise.reject(error);
  }
);
