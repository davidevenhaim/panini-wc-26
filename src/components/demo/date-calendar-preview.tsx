"use client";

import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";

import type { DemoDateFileForm } from "@/components/demo/data";
import { Calendar } from "@/components/ui/calendar";
import { Typography } from "@/components/ui/typography";

export function DateCalendarPreview() {
  const t = useTranslations("demo.forms");
  const { watch, setValue } = useFormContext<DemoDateFileForm>();
  const date = watch("date");

  return (
    <div className="space-y-2">
      <Typography variant="label2" as="p" color="muted">
        {t("calendarPreviewTitle")}
      </Typography>
      <div className="flex justify-center rounded-md border p-2">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(nextDate) =>
            setValue("date", nextDate, { shouldDirty: true, shouldValidate: true })
          }
        />
      </div>
    </div>
  );
}
