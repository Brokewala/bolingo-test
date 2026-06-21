import { clientFetch } from "@/lib/api/client";
import type { AuthResult, GoogleAuthSuccess } from "@/lib/types/auth";

/**
 * Passe par la route API Next.js (same-origin) qui proxy vers Django.
 */
export async function loginWithGoogleIdToken(
  idToken: string,
): Promise<AuthResult> {
  const result = await clientFetch<GoogleAuthSuccess>("/api/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token: idToken }),
  });

  if (!result.ok) {
    return {
      ok: false,
      status: result.status,
      error:
        result.status === 0
          ? "Connexion au serveur impossible. Vérifiez que Next.js et Django sont démarrés."
          : result.error,
    };
  }

  return { ok: true, data: result.data };
}
