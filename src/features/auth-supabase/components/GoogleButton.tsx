"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/iconify";
import { toastError } from "@/lib/toast";
import { CONFIG } from "@/lib/app-config";
import { signInWithGoogleAction } from "../actions";

interface Props {
  label: string;
}

export function GoogleButton({ label }: Props) {
  const t = useTranslations("authSupabase");
  const [pending, start] = useTransition();

  const handleClick = () => {
    if (!CONFIG.isSupabaseConfigured) {
      toastError(t("supabaseNotConfiguredTitle"), t("supabaseNotConfiguredHint"));
      return;
    }
    start(async () => {
      const result = await signInWithGoogleAction();
      if (result?.error) toastError(t("googleFailed"), result.error);
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleClick}
      loading={pending}
    >
      <Iconify icon="logos:google-icon" className="me-2 size-4" />
      {label}
    </Button>
  );
}
