import type { ApiError, AuthResult, GoogleAuthSuccess } from "@/lib/types/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Envoie l'id_token Google au backend Django Ninja.
 * Le champ `credential` du callback GoogleLogin est déjà un id_token JWT.
 */
export async function loginWithGoogleIdToken(
  idToken: string,
): Promise<AuthResult> {
  const response = await fetch(`${API_BASE_URL}/api/auth/google/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token: idToken }),
  });

  if (!response.ok) {
    let message = `Erreur HTTP ${response.status}`;

    try {
      const errorBody = (await response.json()) as ApiError;
      if (errorBody.detail) {
        message = errorBody.detail;
      }
    } catch {
      // Réponse non-JSON : on garde le message HTTP générique
    }

    return { ok: false, status: response.status, error: message };
  }

  const data = (await response.json()) as GoogleAuthSuccess;
  return { ok: true, data };
}
