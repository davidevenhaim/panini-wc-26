import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { PageContainer } from "@/components/app";
import Actions from "@/components/demo/layout/actions";
import { DemoLayoutWidth } from "./components/demo-layout-width";
import { DemoTabNav } from "./components/demo-tab-nav";

// Demo section shell — demonstrates how to structure a section with:
// - a shared server-rendered header (title, subtitle, actions)
// - a client-side route-driven tab nav (active state from pathname)
// - per-tab page content rendered as children

export default async function DemoLayout({ children }: { children: ReactNode }) {
  const t = await getTranslations("demo");

  return (
    <PageContainer subtitle={t("layoutSubtitle")} actions={<Actions />}>
      <DemoTabNav />
      <DemoLayoutWidth>{children}</DemoLayoutWidth>
    </PageContainer>
  );
}
