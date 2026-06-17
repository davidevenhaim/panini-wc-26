"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/iconify";
import { useBoolean } from "@/hooks/use-boolean";
import { ReportDialog } from "./report-dialog";
import type { ReportContext } from "./types";

type Props = {
  context: ReportContext;
  variant?: "ghost" | "outline" | "default";
  size?: "sm" | "default" | "lg";
  className?: string;
  /** When true, render compact icon-only trigger. */
  iconOnly?: boolean;
};

export function ReportButton({
  context,
  variant = "ghost",
  size = "sm",
  className,
  iconOnly,
}: Props) {
  const t = useTranslations();
  const open = useBoolean();

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={open.onTrue}
        className={className}
        aria-label={t("dataReport.trigger")}
      >
        <Iconify icon="lucide:flag" className="size-4" />
        {!iconOnly && <span>{t("dataReport.trigger")}</span>}
      </Button>
      <ReportDialog open={open.value} onOpenChange={open.onToggle} context={context} />
    </>
  );
}
