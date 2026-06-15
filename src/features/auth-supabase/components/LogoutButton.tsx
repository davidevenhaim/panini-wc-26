"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/iconify";
import { logoutAction } from "../actions";

interface Props {
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
}

export function LogoutButton({ variant = "ghost", size, className }: Props) {
  const t = useTranslations("authSupabase");
  const [pending, start] = useTransition();

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      loading={pending}
      onClick={() => start(() => logoutAction())}
    >
      <Iconify icon="lucide:log-out" className="me-2 size-4" />
      {t("logout")}
    </Button>
  );
}
