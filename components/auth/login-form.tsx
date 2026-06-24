"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthErrorAlert } from "@/components/auth/auth-error-alert";
import { AuthMethodTabs, type AuthMethod } from "@/components/auth/auth-method-tabs";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import {
  loginWithGoogleIdToken,
  loginWithPassword,
} from "@/lib/api/auth";
import { mapAuthErrorMessage } from "@/lib/auth/errors";
import { resolveDashboardPath } from "@/lib/auth/dashboard";
import { saveAuthSession } from "@/lib/auth/session";
import { validateEmail, validatePhoneNumber } from "@/lib/auth/validation";
import type { AuthSuccess } from "@/lib/types/auth";

/**
 * Page de connexion — Google ou mot de passe (sans OTP).
 */
export function LoginForm() {
  const router = useRouter();
  const [method, setMethod] = useState<AuthMethod>("email");
  const [phoneNumber, setPhoneNumber] = useState("+269");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleMethodChange(next: AuthMethod) {
    setMethod(next);
    setError(null);
    setFieldError(null);
  }

  function handleAuthSuccess(data: AuthSuccess) {
    saveAuthSession(data);
    router.replace(resolveDashboardPath(data.user));
  }

  async function handleGoogleSuccess(idToken: string) {
    setLoading(true);
    setError(null);

    const result = await loginWithGoogleIdToken(idToken);
    setLoading(false);

    if (!result.ok) {
      setError(mapAuthErrorMessage(result.error));
      return;
    }

    handleAuthSuccess(result.data);
  }

  async function handlePasswordLogin(event: React.FormEvent) {
    event.preventDefault();
    setFieldError(null);
    setError(null);

    if (method === "email") {
      const validationError = validateEmail(email);
      if (validationError) {
        setFieldError(validationError);
        return;
      }
    } else if (method === "phone") {
      const validationError = validatePhoneNumber(phoneNumber);
      if (validationError) {
        setFieldError(validationError);
        return;
      }
    }

    if (!password) {
      setFieldError("Le mot de passe est obligatoire.");
      return;
    }

    setLoading(true);

    const result = await loginWithPassword(
      method === "email"
        ? { email: email.trim(), password }
        : { phone_number: phoneNumber.trim(), password },
    );
    setLoading(false);

    if (!result.ok) {
      setError(mapAuthErrorMessage(result.error));
      return;
    }

    handleAuthSuccess(result.data);
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-50 px-4 py-16">
      <main className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <header className="mb-8 space-y-2">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            Bolingo
          </p>
          <h1 className="text-2xl font-semibold text-zinc-900">Connexion</h1>
          <p className="text-sm leading-6 text-zinc-600">
            Connectez-vous avec Google ou votre mot de passe. L&apos;OTP sert
            uniquement à l&apos;activation lors de l&apos;inscription.
          </p>
        </header>

        <AuthMethodTabs active={method} onChange={handleMethodChange} />

        <div className={method === "google" ? "mb-0" : "hidden"} aria-hidden={method !== "google"}>
          <GoogleAuthButton
            disabled={loading || method !== "google"}
            onSuccess={(token) => void handleGoogleSuccess(token)}
            onError={setError}
          />
        </div>

        {method === "phone" && (
          <form
            data-testid="phone-login-form"
            noValidate
            onSubmit={(e) => void handlePasswordLogin(e)}
            className="space-y-4"
          >
            <label className="block text-sm font-medium text-zinc-700">
              Numéro de téléphone
              <input
                data-testid="phone-input"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+2693900000"
                className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-zinc-400 focus:ring-2"
              />
            </label>
            <label className="block text-sm font-medium text-zinc-700">
              Mot de passe
              <input
                data-testid="password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-zinc-400 focus:ring-2"
              />
            </label>
            {fieldError && (
              <p data-testid="phone-field-error" className="text-sm text-red-600">
                {fieldError}
              </p>
            )}
            <button
              type="submit"
              data-testid="phone-login-submit"
              disabled={loading}
              className="w-full rounded-full bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
            >
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>
        )}

        {method === "email" && (
          <form
            data-testid="email-login-form"
            noValidate
            onSubmit={(e) => void handlePasswordLogin(e)}
            className="space-y-4"
          >
            <label className="block text-sm font-medium text-zinc-700">
              Adresse email
              <input
                data-testid="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="utilisateur@exemple.com"
                className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-zinc-400 focus:ring-2"
              />
            </label>
            <label className="block text-sm font-medium text-zinc-700">
              Mot de passe
              <input
                data-testid="password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-zinc-400 focus:ring-2"
              />
            </label>
            {fieldError && (
              <p data-testid="email-field-error" className="text-sm text-red-600">
                {fieldError}
              </p>
            )}
            <button
              type="submit"
              data-testid="email-login-submit"
              disabled={loading}
              className="w-full rounded-full bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
            >
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>
        )}

        {error && (
          <div className="mt-6">
            <AuthErrorAlert message={error} />
          </div>
        )}

        <p className="mt-8 text-center text-sm text-zinc-600">
          Pas encore de compte ?{" "}
          <Link href="/register" className="font-medium text-zinc-900 underline">
            S&apos;inscrire
          </Link>
        </p>
      </main>
    </div>
  );
}
