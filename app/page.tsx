"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { resolveDashboardPath } from "@/lib/auth/dashboard";
import { getAuthSession } from "@/lib/auth/session";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const auth = getAuthSession();
    if (auth) {
      router.replace(resolveDashboardPath(auth.user));
    }
  }, [router]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-4">
      <main className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">Bolingo Test</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          Interface de test — authentification hybride Google, SMS et Email OTP.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition hover:bg-zinc-700"
          >
            Connexion
          </Link>
          <Link
            href="/register"
            className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-300 px-6 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
          >
            Inscription
          </Link>
        </div>
      </main>
    </div>
  );
}
