import type { AuthSuccess } from "@/lib/types/auth";

export const AUTH_STORAGE_KEY = "bolingo_auth";

export function saveAuthSession(data: AuthSuccess): void {
  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
}

export function getAuthSession(): AuthSuccess | null {
  const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthSuccess;
  } catch {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function updateAuthUser(user: AuthSuccess["user"]): void {
  const session = getAuthSession();
  if (!session) return;
  saveAuthSession({ ...session, user });
}

export function clearAuthSession(): void {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
}
