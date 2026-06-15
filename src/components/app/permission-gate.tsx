"use client";

import type { ReactNode } from "react";
import { usePermissions } from "@/hooks/use-permissions";

type PermissionGateProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

/**
 * Renders children only when the current user is authenticated.
 * To extend with role checks: see comment in src/hooks/use-permissions.ts —
 * once `hasRole` is added to the hook, accept a `roles` prop here and gate on it.
 *
 * @example
 * <PermissionGate fallback={<LoginPrompt />}>
 *   <ProtectedUI />
 * </PermissionGate>
 */
export function PermissionGate({ children, fallback = null }: PermissionGateProps) {
  const { isAuthenticated, isLoading } = usePermissions();
  if (isLoading) return null;
  return isAuthenticated ? <>{children}</> : <>{fallback}</>;
}
