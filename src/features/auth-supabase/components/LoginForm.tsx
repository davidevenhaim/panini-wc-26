"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import Link from "next/link";
import { Form, TextInput } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { toastError } from "@/lib/toast";
import WEB_ROUTES from "@/constants/web-routes.constants";
import { loginSchema, type LoginFormValues } from "../validation/auth.schema";
import { loginAction } from "../actions";
import { GoogleButton } from "./GoogleButton";
import { SupabaseConfigNotice } from "./SupabaseConfigNotice";

export function LoginForm() {
  const t = useTranslations("authSupabase");
  const [pending, start] = useTransition();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginFormValues) => {
    start(async () => {
      const fd = new FormData();
      fd.set("email", data.email);
      fd.set("password", data.password);
      const result = await loginAction(null, fd);
      if (result?.error) toastError(t("loginFailed"), result.error);
    });
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="space-y-1 text-center">
        <Typography variant="h2">{t("loginTitle")}</Typography>
        <Typography variant="caption2" color="muted">
          {t("loginSubtitle")}
        </Typography>
      </div>

      <SupabaseConfigNotice />

      <Form form={form} onSubmit={onSubmit} className="space-y-4">
        <TextInput name="email" label="labels.email" type="email" required />
        <TextInput name="password" label="labels.password" type="password" required />
        <Button type="submit" loading={pending} className="w-full">
          {t("login")}
        </Button>
      </Form>

      <div className="flex items-center gap-2">
        <div className="bg-border h-px flex-1" />
        <Typography variant="caption2" color="muted">
          {t("or")}
        </Typography>
        <div className="bg-border h-px flex-1" />
      </div>

      <GoogleButton label={t("continueWithGoogle")} />

      <Typography variant="caption2" color="muted" className="text-center">
        {t("noAccount")}{" "}
        <Link href={WEB_ROUTES.SIGNUP} className="text-primary underline">
          {t("signup")}
        </Link>
      </Typography>
    </div>
  );
}
