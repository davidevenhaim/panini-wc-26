import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PageContainer } from "@/components/app";
import { createClient } from "@/lib/supabase/server";
import { CONFIG } from "@/lib/app-config";
import WEB_ROUTES from "@/constants/web-routes.constants";
import { AddTodoForm, TodosList } from "@/features/todos";
import { LogoutButton } from "@/features/auth-supabase";

export default async function TodosPage() {
  const t = await getTranslations("todos");

  if (CONFIG.isSupabaseConfigured) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) redirect(WEB_ROUTES.LOGIN);
  }

  return (
    <PageContainer
      title={t("pageTitle")}
      subtitle={t("pageSubtitle")}
      actions={<LogoutButton variant="outline" />}
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <AddTodoForm />
        <TodosList />
      </div>
    </PageContainer>
  );
}
