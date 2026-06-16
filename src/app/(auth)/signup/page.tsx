import { redirect } from "next/navigation";
import { SignupForm } from "@/features/auth-supabase";
import { CONFIG } from "@/lib/app-config";
import WEB_ROUTES from "@/constants/web-routes.constants";

export default function SignupPage() {
  if (CONFIG.isGoogleOnlyAuth) {
    redirect(WEB_ROUTES.LOGIN);
  }

  return <SignupForm />;
}
