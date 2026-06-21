"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { fetchCurrentUser, logoutUser } from "@/lib/api/users";
import { clearAuthSession, getAuthSession } from "@/lib/auth/session";
import type { GoogleAuthSuccess, UserOut } from "@/lib/types/auth";

type MeState =
  | { status: "loading" }
  | { status: "success"; user: UserOut }
  | { status: "error"; message: string; httpStatus?: number };

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<GoogleAuthSuccess | null>(null);
  const [meState, setMeState] = useState<MeState>({ status: "loading" });
  const [logoutMessage, setLogoutMessage] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const loadMe = useCallback(async (accessToken: string) => {
    setMeState({ status: "loading" });

    const result = await fetchCurrentUser(accessToken);

    if (!result.ok) {
      if (result.status === 401) {
        clearAuthSession();
        router.replace("/login");
        return;
      }

      setMeState({
        status: "error",
        message: result.error,
        httpStatus: result.status,
      });
      return;
    }

    setMeState({ status: "success", user: result.data });
  }, [router]);

  useEffect(() => {
    const auth = getAuthSession();

    if (!auth) {
      router.replace("/login");
      return;
    }

    setSession(auth);
    void loadMe(auth.access);
  }, [loadMe, router]);

  async function handleLogout() {
    if (!session) return;

    setLoggingOut(true);
    setLogoutMessage(null);

    const result = await logoutUser(session.access, session.refresh);

    clearAuthSession();

    if (result.ok) {
      router.replace("/login");
      return;
    }

    setLoggingOut(false);
    setLogoutMessage(
      `Session locale effacée, mais erreur API logout : ${result.error}`,
    );
    router.replace("/login");
  }

  if (!session || meState.status === "loading") {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center text-sm text-zinc-500">
        Chargement du profil via GET /api/users/me…
      </div>
    );
  }

  const user =
    meState.status === "success" ? meState.user : session.user;
  const profile = meState.status === "success" ? meState.user : null;

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-50 px-4 py-16">
      <main className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-600">
              Dashboard
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-zinc-900">
              Bienvenue, {user.first_name || "utilisateur"}
            </h1>
            <p className="mt-2 text-sm text-zinc-600">
              {session.is_new_user
                ? "Compte créé via Google."
                : "Connexion avec un compte existant."}
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

        {meState.status === "success" && (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            GET <code>/api/users/me</code> — OK (200)
          </div>
        )}

        {meState.status === "error" && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            GET <code>/api/users/me</code> — échec
            {meState.httpStatus ? ` (${meState.httpStatus})` : ""} :{" "}
            {meState.message}
          </div>
        )}

        <dl className="grid gap-4 rounded-xl bg-zinc-50 p-4 text-sm">
          {profile && (
            <div>
              <dt className="font-medium text-zinc-500">Username</dt>
              <dd className="break-all text-zinc-900">{profile.username}</dd>
            </div>
          )}
          <div>
            <dt className="font-medium text-zinc-500">Nom complet</dt>
            <dd className="text-zinc-900">
              {user.first_name} {user.last_name}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500">Google ID</dt>
            <dd className="break-all text-zinc-900">{user.google_id ?? "—"}</dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-500">Téléphone</dt>
            <dd className="text-zinc-900">{user.phone_number ?? "—"}</dd>
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
            {JSON.stringify(
              { access: session.access, refresh: session.refresh },
              null,
              2,
            )}
          </pre>
        </details>

        {logoutMessage && (
          <p className="mt-4 text-sm text-amber-700">{logoutMessage}</p>
        )}

        <footer className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void loadMe(session.access)}
            className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-300 px-5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Re-tester GET /me
          </button>
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={loggingOut}
            className="inline-flex h-10 items-center justify-center rounded-full border border-red-300 px-5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
          >
            {loggingOut ? "Déconnexion…" : "POST /logout"}
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
