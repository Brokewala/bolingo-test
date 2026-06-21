import type { AuthUserProfile, DashboardKind } from "@/lib/types/auth";

/**
 * Priorité de redirection après connexion :
 * admin (is_staff) > seller (is_seller) > buyer (défaut).
 */
export function resolveDashboardKind(user: AuthUserProfile): DashboardKind {
  if (user.is_staff) return "admin";
  if (user.is_seller) return "seller";
  return "buyer";
}

export function dashboardPath(kind: DashboardKind): string {
  return `/dashboard/${kind}`;
}

export function resolveDashboardPath(user: AuthUserProfile): string {
  return dashboardPath(resolveDashboardKind(user));
}
