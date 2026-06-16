"use client";

import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Typography } from "@/components/ui/typography";
import { LocalePicker } from "@/components/app/locale-picker";
import { ThemePicker } from "@/components/app/theme-picker";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AppSettingsDialog({ open, onOpenChange }: Props) {
  const t = useTranslations();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle>{t("settings.dialogTitle")}</DialogTitle>
          <DialogDescription>{t("settings.dialogDescription")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <section className="space-y-2">
            <Typography variant="label2" as="p" className="text-muted-foreground px-1">
              {t("themeCurrentLabel")}
            </Typography>
            <ThemePicker />
          </section>

          <section className="space-y-2">
            <Typography variant="label2" as="p" className="text-muted-foreground px-1">
              {t("languageDialogTitle")}
            </Typography>
            <LocalePicker onSelected={() => onOpenChange(false)} />
            <Typography variant="caption2" as="p" color="muted" className="px-1">
              {t("languageSettingsNote")}
            </Typography>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
