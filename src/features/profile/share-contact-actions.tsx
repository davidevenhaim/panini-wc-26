"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/iconify";
import { toastError, toastSuccess } from "@/lib/toast";
import {
  contactHref,
  contactHrefWithText,
  contactIcon,
  contactLabel,
  supportsPrefill,
} from "@/lib/album/contact";
import type { ContactMethod } from "@/types/profile.types";

type Props = {
  method: ContactMethod | null;
  value: string | null;
  message: string;
  /** When true, shows the contact button on white-on-gradient (hero) styling. */
  hero?: boolean;
};

export function ShareContactActions({ method, value, message, hero }: Props) {
  const t = useTranslations();

  const prefillHref = contactHrefWithText(method, value, message);
  const plainHref = contactHref(method, value);
  const canPrefill = supportsPrefill(method);

  if (!plainHref) return null;

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message);
      toastSuccess(t("share.messageCopied"));
    } catch {
      toastError(t("profile.copyFailed"));
    }
  };

  const contactClass = hero
    ? "bg-white text-emerald-700 hover:bg-white/90"
    : "bg-emerald-600 hover:bg-emerald-700";

  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild className={contactClass}>
        <a href={prefillHref ?? plainHref} target="_blank" rel="noreferrer">
          <Iconify icon={contactIcon(method)} className="size-4" />
          {canPrefill
            ? t("share.contactPrefilled", { method: contactLabel(method) })
            : t("share.contact", { method: contactLabel(method) })}
        </a>
      </Button>
      <Button
        type="button"
        variant={hero ? "secondary" : "outline"}
        onClick={copyMessage}
        className={hero ? "bg-white/15 text-white hover:bg-white/25" : undefined}
      >
        <Iconify icon="lucide:clipboard-copy" className="size-4" />
        {t("share.copyMessage")}
      </Button>
    </div>
  );
}
