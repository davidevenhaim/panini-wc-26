import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { LOCALE_COOKIE, resolveAppLocale } from "@/constants/locale";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const raw = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = resolveAppLocale(raw);

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
