"use client";

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  loginWithGoogleIdToken,
  sendOtp,
  verifyOtp,
} from "@/lib/api/auth";
import { resolveDashboardPath } from "@/lib/auth/dashboard";
import { saveAuthSession } from "@/lib/auth/session";

type AuthTab = "phone" | "google";
type PhoneStep = "number" | "code";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<AuthTab>("phone");
  const [phoneStep, setPhoneStep] = useState<PhoneStep>("number");
  const [phoneNumber, setPhoneNumber] = useState("+269");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [otpSentMessage, setOtpSentMessage] = useState<string | null>(null);

  function handleAuthSuccess(data: Parameters<typeof saveAuthSession>[0]) {
    saveAuthSession(data);
    router.replace(resolveDashboardPath(data.user));
  }

  async function handleGoogleSuccess(response: CredentialResponse) {
    const idToken = response.credential;

    if (!idToken) {
      setError("Google n'a pas renvoyé de credential (id_token).");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await loginWithGoogleIdToken(idToken);
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    handleAuthSuccess(result.data);
  }

  async function handleSendOtp(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setOtpSentMessage(null);

    const result = await sendOtp(phoneNumber.trim());
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setPhoneStep("code");
    const devHint = result.data.dev_code
      ? ` Code dev : ${result.data.dev_code}`
      : "";
    setOtpSentMessage(
      `${result.data.detail} (expire dans ${result.data.expires_in_seconds}s)${devHint}`,
    );
    if (result.data.dev_code) {
      setOtpCode(result.data.dev_code);
    }
  }

  async function handleVerifyOtp(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await verifyOtp(phoneNumber.trim(), otpCode.trim());
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    handleAuthSuccess(result.data);
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-50 px-4 py-16">
      <main className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <header className="mb-8 space-y-2">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            Bolingo — Test auth
          </p>
          <h1 className="text-2xl font-semibold text-zinc-900">
            Connexion / Inscription
          </h1>
          <p className="text-sm leading-6 text-zinc-600">
            Téléphone (OTP Twilio) ou Google. Redirection automatique vers le
            dashboard selon vos rôles (admin, seller, buyer).
          </p>
        </header>

        <div className="mb-6 flex rounded-lg border border-zinc-200 p-1">
          <button
            type="button"
            onClick={() => {
              setTab("phone");
              setError(null);
            }}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
              tab === "phone"
                ? "bg-zinc-900 text-white"
                : "text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            Téléphone
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("google");
              setError(null);
            }}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
              tab === "google"
                ? "bg-zinc-900 text-white"
                : "text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            Google
          </button>
        </div>

        {tab === "phone" && phoneStep === "number" && (
          <form onSubmit={(e) => void handleSendOtp(e)} className="space-y-4">
            <label className="block text-sm font-medium text-zinc-700">
              Numéro international
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+2693900000"
                className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-zinc-400 focus:ring-2"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
            >
              {loading ? "Envoi…" : "POST /auth/send-otp"}
            </button>
          </form>
        )}

        {tab === "phone" && phoneStep === "code" && (
          <form onSubmit={(e) => void handleVerifyOtp(e)} className="space-y-4">
            {otpSentMessage && (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                {otpSentMessage}
              </p>
            )}
            <p className="text-sm text-zinc-600">
              Code envoyé à <strong>{phoneNumber}</strong>
            </p>
            <label className="block text-sm font-medium text-zinc-700">
              Code à 6 chiffres
              <input
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm tracking-widest outline-none ring-zinc-400 focus:ring-2"
              />
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setPhoneStep("number");
                  setOtpCode("");
                  setOtpSentMessage(null);
                }}
                className="flex-1 rounded-full border border-zinc-300 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Changer de numéro
              </button>
              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="flex-1 rounded-full bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
              >
                {loading ? "Vérification…" : "POST /auth/verify-otp"}
              </button>
            </div>
          </form>
        )}

        {tab === "google" && (
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={(r) => void handleGoogleSuccess(r)}
              onError={() =>
                setError("Connexion Google annulée ou échouée côté client.")
              }
              useOneTap={false}
              theme="outline"
              size="large"
              text="continue_with"
              shape="rectangular"
            />
          </div>
        )}

        {loading && tab === "google" && (
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

        <p className="mt-8 text-center text-xs text-zinc-500">
          Nouveau compte téléphone : <code>is_buyer=true</code>,{" "}
          <code>is_seller=false</code> par défaut.
        </p>
      </main>
    </div>
  );
}
