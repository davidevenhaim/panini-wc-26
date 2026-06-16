"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import Iconify from "@/components/ui/iconify";
import { LocalePicker } from "@/components/app/locale-picker";
import { useLocaleSwitch } from "@/hooks/use-locale-switch";

/**
 * Globe trigger opens a compact popover to pick the app locale.
 * Prefer `AppSettingsDialog` in the album header; kept for reuse elsewhere.
 */
export function LocaleDialog() {
  const t = useTranslations();
  const [open, setOpen] = React.useState(false);
  const { isSwitchingLocale } = useLocaleSwitch();

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
        <LocalePicker onSelected={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
