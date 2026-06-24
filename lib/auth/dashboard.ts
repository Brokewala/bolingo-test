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

/** Nom affiché (API login = prenom/nom, legacy = first_name/last_name). */
export function userDisplayName(user: {
  prenom?: string;
  nom?: string;
  first_name?: string;
  last_name?: string;
}): string {
  const first = user.prenom?.trim() || user.first_name?.trim() || "";
  const last = user.nom?.trim() || user.last_name?.trim() || "";
  const full = [first, last].filter(Boolean).join(" ");
  return full || "utilisateur";
}
