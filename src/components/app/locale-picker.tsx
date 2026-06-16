"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/iconify";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { SUPPORTED_LOCALES, type AppLocale } from "@/constants/locale";
import { useLocaleSwitch } from "@/hooks/use-locale-switch";

const LOCALE_ICON: Record<AppLocale, string> = {
  en: "ri:english-input",
  he: "tabler:alphabet-hebrew",
  ar: "tabler:alphabet-arabic",
  es: "tabler:language",
};

type Props = {
  onSelected?: () => void;
};

export function LocalePicker({ onSelected }: Props) {
  const t = useTranslations();
  const { locale, isSwitchingLocale, selectLocale } = useLocaleSwitch();

  const handleSelect = (code: AppLocale) => {
    if (code === locale) {
      onSelected?.();
      return;
    }
    if (selectLocale(code)) onSelected?.();
  };

  return (
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
              onClick={() => handleSelect(code)}
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
  );
}
