"use client";

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { loginWithGoogleIdToken } from "@/lib/api/auth";
import { saveAuthSession } from "@/lib/auth/session";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGoogleSuccess(response: CredentialResponse) {
    const idToken = response.credential;

    if (!idToken) {
      setError("Google n'a pas renvoyé de credential (id_token).");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await loginWithGoogleIdToken(idToken);

    if (!result.ok) {
      setLoading(false);
      setError(result.error);
      return;
    }

    saveAuthSession(result.data);
    router.replace("/dashboard");
  }

  function handleGoogleError() {
    setError("Connexion Google annulée ou échouée côté client.");
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-50 px-4 py-16">
      <main className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <header className="mb-8 space-y-2">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            Bolingo — Test auth
          </p>
          <h1 className="text-2xl font-semibold text-zinc-900">
            Connexion / Inscription Google
          </h1>
          <p className="text-sm leading-6 text-zinc-600">
            Authentification via Google, puis redirection vers le dashboard.
          </p>
        </header>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false}
            theme="outline"
            size="large"
            text="continue_with"
            shape="rectangular"
          />
        </div>

        {loading && (
          <p className="mt-6 text-center text-sm text-zinc-500">
            Connexion en cours…
          </p>
        )}

        {error && (
          <section
            aria-live="polite"
            className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <h2 className="font-semibold">Erreur</h2>
            <p className="mt-2">{error}</p>
          </section>
        )}
      </main>
    </div>
  );
}
