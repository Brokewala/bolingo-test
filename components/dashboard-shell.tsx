"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { switchDashboard } from "@/lib/api/auth";
import { fetchCurrentUser, logoutUser } from "@/lib/api/users";
import {
  dashboardPath,
  resolveDashboardKind,
  resolveDashboardPath,
} from "@/lib/auth/dashboard";
import {
  clearAuthSession,
  getAuthSession,
  updateAuthUser,
} from "@/lib/auth/session";
import type { AuthSuccess, DashboardKind, UserOut } from "@/lib/types/auth";

const DASHBOARD_LABELS: Record<DashboardKind, string> = {
  admin: "Administration",
  seller: "Vendeur",
  buyer: "Acheteur",
};

type MeState =
  | { status: "loading" }
  | { status: "success"; user: UserOut }
  | { status: "error"; message: string; httpStatus?: number };

type DashboardShellProps = {
  kind: DashboardKind;
};

export function DashboardShell({ kind }: DashboardShellProps) {
  const router = useRouter();
  const [session, setSession] = useState<AuthSuccess | null>(null);
  const [meState, setMeState] = useState<MeState>({ status: "loading" });
  const [logoutMessage, setLogoutMessage] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

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

    const expectedKind = resolveDashboardKind(auth.user);
    if (kind !== expectedKind) {
      router.replace(resolveDashboardPath(auth.user));
      return;
    }

    setSession(auth);
    void loadMe(auth.access);
  }, [kind, loadMe, router]);

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

  async function handleSwitchDashboard() {
    if (!session) return;

    setSwitching(true);
    setActionMessage(null);

    const result = await switchDashboard(session.access);
    setSwitching(false);

    if (!result.ok) {
      setActionMessage(result.error);
      return;
    }

    updateAuthUser(result.data.user);
    setSession(getAuthSession());
    setActionMessage(result.data.detail);
    router.replace(dashboardPath("seller"));
  }

  if (!session || meState.status === "loading") {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center text-sm text-zinc-500">
        Chargement du dashboard {DASHBOARD_LABELS[kind]}…
      </div>
    );
  }

  const user =
    meState.status === "success" ? meState.user : session.user;
  const profile = meState.status === "success" ? meState.user : null;
  const roles = profile?.roles ?? session.user.roles;

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-50 px-4 py-16">
      <main className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-600">
              Dashboard — {DASHBOARD_LABELS[kind]}
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-zinc-900">
              Bienvenue, {user.first_name || "utilisateur"}
            </h1>
            <p className="mt-2 text-sm text-zinc-600">
              {session.is_new_user
                ? "Nouveau compte créé."
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

        <div className="mb-6 flex flex-wrap gap-2">
          {(["buyer", "seller", "admin"] as DashboardKind[]).map((k) => (
            <Link
              key={k}
              href={dashboardPath(k)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                k === kind
                  ? "bg-zinc-900 text-white"
                  : "border border-zinc-300 text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {DASHBOARD_LABELS[k]}
            </Link>
          ))}
        </div>

        <dl className="mb-6 grid gap-3 rounded-xl bg-zinc-50 p-4 text-sm">
          <div className="grid grid-cols-3 gap-2">
            <dt className="font-medium text-zinc-500">is_buyer</dt>
            <dd className="col-span-2 text-zinc-900">
              {String(profile?.is_buyer ?? session.user.is_buyer)}
            </dd>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <dt className="font-medium text-zinc-500">is_seller</dt>
            <dd className="col-span-2 text-zinc-900">
              {String(profile?.is_seller ?? session.user.is_seller)}
            </dd>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <dt className="font-medium text-zinc-500">is_staff</dt>
            <dd className="col-span-2 text-zinc-900">
              {String(profile?.is_staff ?? session.user.is_staff)}
            </dd>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <dt className="font-medium text-zinc-500">roles</dt>
            <dd className="col-span-2 text-zinc-900">{roles.join(", ")}</dd>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <dt className="font-medium text-zinc-500">Téléphone</dt>
            <dd className="col-span-2 text-zinc-900">
              {user.phone_number ?? "—"}
            </dd>
          </div>
        </dl>

        {kind === "buyer" && !session.user.is_seller && (
          <button
            type="button"
            onClick={() => void handleSwitchDashboard()}
            disabled={switching}
            className="mb-6 w-full rounded-full border border-emerald-300 bg-emerald-50 py-2.5 text-sm font-medium text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
          >
            {switching
              ? "Activation…"
              : "POST /auth/switch-dashboard — Devenir vendeur"}
          </button>
        )}

        {actionMessage && (
          <p className="mb-4 text-sm text-emerald-700">{actionMessage}</p>
        )}

        {logoutMessage && (
          <p className="mb-4 text-sm text-amber-700">{logoutMessage}</p>
        )}

        <footer className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void loadMe(session.access)}
            className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-300 px-5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Re-tester GET /me
          </button>
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={loggingOut}
            className="inline-flex h-10 items-center justify-center rounded-full border border-red-300 px-5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            {loggingOut ? "Déconnexion…" : "Logout"}
          </button>
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-full bg-zinc-900 px-5 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Retour login
          </Link>
        </footer>
      </main>
    </div>
  );
}
