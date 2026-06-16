"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  getLocaleDirection,
  resolveAppLocale,
  type AppLocale,
} from "@/constants/locale";

export function useLocaleSwitch() {
  const router = useRouter();
  const rawLocale = useLocale();
  const locale: AppLocale = resolveAppLocale(rawLocale);
  const [pendingLocale, setPendingLocale] = React.useState<AppLocale | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const isSwitchingLocale = isPending || pendingLocale !== null;

  React.useEffect(() => {
    if (!pendingLocale) return;

    const root = document.documentElement;
    const nextDir = getLocaleDirection(pendingLocale);
    const currentDir = root.dir === "rtl" ? "rtl" : "ltr";
    const isDirectionChange = currentDir !== nextDir;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const refreshLocale = () => {
      root.lang = pendingLocale;
      root.dir = nextDir;
      startTransition(() => {
        router.refresh();
      });
    };

    if (!isDirectionChange || prefersReducedMotion) {
      refreshLocale();
      setPendingLocale(null);
      return;
    }

    root.classList.add("locale-direction-switching");

    const fadeOutFrame = window.requestAnimationFrame(() => {
      root.classList.add("locale-direction-switching-active");
    });

    const refreshTimer = window.setTimeout(() => {
      refreshLocale();
      root.classList.remove("locale-direction-switching-active");
    }, 240);

    const cleanupTimer = window.setTimeout(() => {
      root.classList.remove("locale-direction-switching");
      setPendingLocale(null);
    }, 720);

    return () => {
      window.cancelAnimationFrame(fadeOutFrame);
      window.clearTimeout(refreshTimer);
      window.clearTimeout(cleanupTimer);
      root.classList.remove("locale-direction-switching", "locale-direction-switching-active");
    };
  }, [pendingLocale, router, startTransition]);

  React.useEffect(() => {
    if (pendingLocale) return;

    const root = document.documentElement;
    root.lang = locale;
    root.dir = getLocaleDirection(locale);
  }, [locale, pendingLocale]);

  const selectLocale = (code: AppLocale) => {
    if (isSwitchingLocale) return false;

    if (code === locale) return true;

    Cookies.set(LOCALE_COOKIE, code, {
      path: "/",
      expires: LOCALE_COOKIE_MAX_AGE / (60 * 60 * 24),
      sameSite: "lax",
    });

    setPendingLocale(code);
    return true;
  };

  return { locale, isSwitchingLocale, selectLocale };
}
