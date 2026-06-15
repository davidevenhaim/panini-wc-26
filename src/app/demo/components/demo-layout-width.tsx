"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import WEB_ROUTES from "@/constants/web-routes.constants";
import { cn } from "@/lib/utils";

export function DemoLayoutWidth({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === WEB_ROUTES.DEMO_LANDING;

  return <div className={cn("w-full", !isLanding && "mx-auto max-w-7xl")}>{children}</div>;
}
