"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import Iconify from "@/components/ui/iconify";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  SUPPORTED_LOCALES,
  getLocaleDirection,
  isAppLocale,
  type AppLocale,
} from "@/constants/locale";
import Cookies from "js-cookie";

const LOCALE_ICON: Record<AppLocale, string> = {
  en: "ri:english-input",
  he: "tabler:alphabet-hebrew",
  ar: "tabler:alphabet-arabic",
  es: "tabler:language",
};

/**
 * Globe trigger opens a compact popover to pick the app locale.
 * Sets `NEXT_LOCALE` and refreshes server components without a full browser reload.
 */
export function LocaleDialog() {
  const t = useTranslations();
  const router = useRouter();
  const rawLocale = useLocale();
  const locale: AppLocale = isAppLocale(rawLocale) ? rawLocale : "en";
  const [open, setOpen] = React.useState(false);
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

  const select = (code: AppLocale) => {
    if (isSwitchingLocale) return;

    if (code === locale) {
      setOpen(false);
      return;
    }
    Cookies.set(LOCALE_COOKIE, code, {
      path: "/",
      expires: LOCALE_COOKIE_MAX_AGE / (60 * 60 * 24),
      sameSite: "lax",
    });

    setOpen(false);
    setPendingLocale(code);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t("languageDialogTriggerAria")}
          aria-haspopup="menu"
          aria-expanded={open}
          disabled={isSwitchingLocale}
        >
          <Iconify icon="lucide:languages" className="size-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 rounded-xl p-2" sideOffset={8}>
        <PopoverHeader className="px-2 pt-1 pb-2">
          <PopoverTitle className="text-start">{t("languageDialogTitle")}</PopoverTitle>
        </PopoverHeader>
        <ul className="flex flex-col gap-0.5" role="menu">
          {SUPPORTED_LOCALES.map((code) => {
            const active = code === locale;
            return (
              <li key={code} role="none">
                <Button
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  variant="ghost"
                  disabled={isSwitchingLocale}
                  className={cn(
                    "relative flex h-auto w-full items-center justify-start rounded-lg px-3 py-3 text-start transition-all outline-none",
                    "hover:bg-accent/80 hover:text-accent-foreground",
                    "focus-visible:bg-accent/80 focus-visible:text-accent-foreground",
                    active && "bg-accent text-accent-foreground shadow-sm"
                  )}
                  onClick={() => select(code)}
                >
                  {active ? (
                    <span
                      className="bg-primary absolute inset-y-2 start-1 w-0.5 rounded-full"
                      aria-hidden
                    />
                  ) : null}
                  <div className="flex min-w-0 flex-1 items-center gap-3 ps-2 pe-7">
                    <div
                      className={cn(
                        "bg-muted/60 text-foreground flex size-8 shrink-0 items-center justify-center rounded-md",
                        active && "bg-background/75"
                      )}
                    >
                      <Iconify icon={LOCALE_ICON[code]} className="size-5" aria-hidden />
                    </div>
                    <Typography
                      variant="label2"
                      as="span"
                      className="min-w-0 flex-1 truncate text-start font-medium"
                    >
                      {t(`languages.${code}`)}
                    </Typography>
                  </div>
                  {active ? (
                    <Iconify
                      icon="lucide:check"
                      className="absolute end-2.5 size-4 shrink-0"
                      aria-hidden
                    />
                  ) : null}
                </Button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
