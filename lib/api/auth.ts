import type { ApiError, AuthResult, GoogleAuthSuccess } from "@/lib/types/auth";

/**
 * Passe par la route API Next.js (same-origin) qui proxy vers Django.
 * Évite les erreurs CORS / "Failed to fetch" du navigateur.
 */
export async function loginWithGoogleIdToken(
  idToken: string,
): Promise<AuthResult> {
  try {
    const response = await fetch("/api/auth/google", {
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
        // Réponse non-JSON
      }

      return { ok: false, status: response.status, error: message };
    }

    const data = (await response.json()) as GoogleAuthSuccess;
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      status: 0,
      error:
        "Connexion au serveur impossible. Vérifiez que Next.js et Django sont démarrés.",
    };
  }
}
