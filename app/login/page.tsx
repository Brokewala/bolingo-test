"use client";

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useState } from "react";

import { loginWithGoogleIdToken } from "@/lib/api/auth";
import type { GoogleAuthSuccess } from "@/lib/types/auth";

type ViewState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; data: GoogleAuthSuccess }
  | { kind: "error"; message: string; status?: number };

export default function LoginPage() {
  const [state, setState] = useState<ViewState>({ kind: "idle" });

  /** Appelé par GoogleLogin quand l'utilisateur s'authentifie avec succès */
  async function handleGoogleSuccess(response: CredentialResponse) {
    const idToken = response.credential;

    if (!idToken) {
      setState({
        kind: "error",
        message: "Google n'a pas renvoyé de credential (id_token).",
      });
      return;
    }

    setState({ kind: "loading" });

    // Envoi de l'id_token au backend Django Ninja
    const result = await loginWithGoogleIdToken(idToken);

    if (result.ok) {
      setState({ kind: "success", data: result.data });
      return;
    }

    setState({
      kind: "error",
      message: result.error,
      status: result.status,
    });
  }

  function handleGoogleError() {
    setState({
      kind: "error",
      message: "Connexion Google annulée ou échouée côté client.",
    });
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
            Ce bouton obtient un <code className="text-xs">id_token</code> via le
            SDK Google, puis l&apos;envoie en POST à{" "}
            <code className="text-xs">/api/auth/google/</code> sur Django Ninja.
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

        {state.kind === "loading" && (
          <p className="mt-6 text-center text-sm text-zinc-500">
            Validation du token auprès du backend…
          </p>
        )}

        {state.kind === "success" && (
          <section
            aria-live="polite"
            className="mt-8 space-y-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4"
          >
            <h2 className="text-sm font-semibold text-emerald-800">
              Authentification réussie
              {state.data.is_new_user ? " (nouveau compte)" : " (compte existant)"}
            </h2>

            <div className="space-y-2 text-sm text-emerald-900">
              <p>
                <span className="font-medium">Utilisateur :</span>{" "}
                {state.data.user.first_name} {state.data.user.last_name}{" "}
                <span className="text-emerald-700">
                  (id: {state.data.user.id}, google_id: {state.data.user.google_id})
                </span>
              </p>
              {state.data.user.avatar_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={state.data.user.avatar_url}
                  alt="Avatar Google"
                  className="h-12 w-12 rounded-full"
                />
              )}
            </div>

            <details className="text-xs text-emerald-900">
              <summary className="cursor-pointer font-medium">
                Voir les JWT de la plateforme
              </summary>
              <pre className="mt-2 overflow-x-auto rounded-lg bg-white p-3 text-[11px] leading-5 text-zinc-800">
                {JSON.stringify(
                  {
                    access: state.data.access,
                    refresh: state.data.refresh,
                    user: state.data.user,
                  },
                  null,
                  2,
                )}
              </pre>
            </details>
          </section>
        )}

        {state.kind === "error" && (
          <section
            aria-live="polite"
            className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <h2 className="font-semibold">Erreur</h2>
            {state.status !== undefined && (
              <p className="mt-1 text-xs text-red-600">HTTP {state.status}</p>
            )}
            <p className="mt-2">{state.message}</p>
          </section>
        )}
      </main>
    </div>
  );
}
