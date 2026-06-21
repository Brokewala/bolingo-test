import type { ApiError } from "@/lib/types/auth";

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string };

export async function parseApiError(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const body = (await response.json()) as ApiError;
    return body.detail || fallback;
  } catch {
    return fallback;
  }
}

export async function clientFetch<T>(
  url: string,
  init?: RequestInit,
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, init);

    if (!response.ok) {
      const message = await parseApiError(
        response,
        `Erreur HTTP ${response.status}`,
      );
      return { ok: false, status: response.status, error: message };
    }

    const data = (await response.json()) as T;
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      status: 0,
      error: "Connexion au serveur impossible.",
    };
  }
}
