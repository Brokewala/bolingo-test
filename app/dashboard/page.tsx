"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { clearAuthSession, getAuthSession } from "@/lib/auth/session";
import type { GoogleAuthSuccess } from "@/lib/types/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<GoogleAuthSuccess | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const auth = getAuthSession();

    if (!auth) {
      router.replace("/login");
      return;
    }

    setSession(auth);
    setReady(true);
  }, [router]);

  function handleLogout() {
    clearAuthSession();
    router.replace("/login");
  }

  if (!ready || !session) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center text-sm text-zinc-500">
        Chargement…
      </div>
    );
  }

  const { user, access, refresh, is_new_user } = session;

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-50 px-4 py-16">
      <main className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-600">
              Dashboard
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-zinc-900">
              Bienvenue, {user.first_name || "utilisateur"}
            </h1>
            <p className="mt-2 text-sm text-zinc-600">
              {is_new_user
                ? "Compte créé avec succès via Google."
                : "Connexion réussie avec un compte existant."}
            </p>
          </div>
          {user.avatar_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatar_url}
              alt="Avatar"
              className="h-16 w-16 rounded-full border border-zinc-200"
            />
          )}
        </header>

        <dl className="grid gap-4 rounded-xl bg-zinc-50 p-4 text-sm">
          <div>
            <dt className="font-medium text-zinc-500">Nom complet</dt>
            <dd className="text-zinc-900">
              {user.first_name} {user.last_name}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500">Google ID</dt>
            <dd className="break-all text-zinc-900">{user.google_id}</dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500">ID plateforme</dt>
            <dd className="text-zinc-900">{user.id}</dd>
          </div>
        </dl>

        <details className="mt-6 text-xs text-zinc-700">
          <summary className="cursor-pointer font-medium">
            Tokens JWT (debug)
          </summary>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-zinc-900 p-4 text-[11px] leading-5 text-zinc-100">
            {JSON.stringify({ access, refresh }, null, 2)}
          </pre>
        </details>

        <footer className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-300 px-5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Se déconnecter
          </button>
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-full bg-zinc-900 px-5 text-sm font-medium text-white transition hover:bg-zinc-700"
          >
            Retour login
          </Link>
        </footer>
      </main>
    </div>
  );
}
