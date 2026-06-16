"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/iconify";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { useThemeStore, type Theme } from "@/store/theme.store";

const THEME_OPTIONS: { value: Theme; icon: string }[] = [
  { value: "light", icon: "lucide:sun" },
  { value: "dark", icon: "lucide:moon" },
];

export function ThemePicker() {
  const t = useTranslations();
  const { theme, setTheme } = useThemeStore();

  return (
    <ul className="flex flex-col gap-0.5" role="menu">
      {THEME_OPTIONS.map(({ value, icon }) => {
        const active = theme === value;
        const label = value === "light" ? t("themeLight") : t("themeDark");

        return (
          <li key={value} role="none">
            <Button
              type="button"
              role="menuitemradio"
              aria-checked={active}
              variant="ghost"
              className={cn(
                "relative flex h-auto w-full items-center justify-start rounded-lg px-3 py-3 text-start transition-all outline-none",
                "hover:bg-accent/80 hover:text-accent-foreground",
                "focus-visible:bg-accent/80 focus-visible:text-accent-foreground",
                active && "bg-accent text-accent-foreground shadow-sm"
              )}
              onClick={() => setTheme(value)}
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
                  <Iconify icon={icon} className="size-5" aria-hidden />
                </div>
                <Typography
                  variant="label2"
                  as="span"
                  className="min-w-0 flex-1 truncate text-start font-medium"
                >
                  {label}
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
