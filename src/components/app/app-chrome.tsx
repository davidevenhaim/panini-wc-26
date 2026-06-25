"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { HomeNavbar } from "@/features/library/home-navbar";
import WEB_ROUTES from "@/constants/web-routes.constants";

type Props = {
  children: ReactNode;
};

function shouldHideNavbar(pathname: string): boolean {
  return (
    pathname === WEB_ROUTES.LOGIN ||
    pathname === WEB_ROUTES.SIGNUP ||
    pathname.startsWith(WEB_ROUTES.AUTH_CALLBACK)
  );
}

export function AppChrome({ children }: Props) {
  const pathname = usePathname();
  const showNavbar = !shouldHideNavbar(pathname);

  return (
    <>
      {showNavbar ? <HomeNavbar /> : null}
      {children}
    </>
  );
}
