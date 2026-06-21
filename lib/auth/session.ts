import type { GoogleAuthSuccess } from "@/lib/types/auth";

export const AUTH_STORAGE_KEY = "bolingo_auth";

export function saveAuthSession(data: GoogleAuthSuccess): void {
  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
}

export function getAuthSession(): GoogleAuthSuccess | null {
  const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as GoogleAuthSuccess;
  } catch {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function clearAuthSession(): void {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
}
