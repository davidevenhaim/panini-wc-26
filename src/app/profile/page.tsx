import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Iconify from "@/components/ui/iconify";
import { Typography } from "@/components/ui/typography";
import WEB_ROUTES from "@/constants/web-routes.constants";
import { CONFIG } from "@/lib/app-config";
import { createClient } from "@/lib/supabase/server";
import { fetchProfileById } from "@/lib/album/supabase-sync";
import { ProfileForm } from "@/features/profile/profile-form";
import { SupabaseConfigNotice } from "@/features/auth-supabase";

export default async function ProfilePage() {
  const t = await getTranslations();

  if (!CONFIG.isSupabaseConfigured) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
        <SupabaseConfigNotice />
      </main>
    );
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect(WEB_ROUTES.LOGIN);

  const profile = await fetchProfileById(supabase, userData.user.id);
  const defaultUsername =
    (userData.user.email?.split("@")[0] ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "")
      .slice(0, 20) || "panini_fan";

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href={WEB_ROUTES.HOME}>
            <Iconify icon="lucide:arrow-left" className="size-4" />
            {t("back")}
          </Link>
        </Button>
        <Typography variant="caption2" as="span" color="muted" className="font-mono">
          {userData.user.email}
        </Typography>
      </div>

      <ProfileForm
        userId={userData.user.id}
        initialProfile={profile}
        defaultUsername={defaultUsername}
      />
    </main>
  );
}
