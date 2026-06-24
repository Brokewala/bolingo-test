"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { AuthErrorAlert } from "@/components/auth/auth-error-alert";
import { AuthMethodTabs, type AuthMethod } from "@/components/auth/auth-method-tabs";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { OtpVerifyForm } from "@/components/auth/otp-verify-form";
import {
  loginWithGoogleIdToken,
  requestEmailOtp,
  sendOtp,
  verifyEmailOtp,
  verifyOtp,
} from "@/lib/api/auth";
import { mapAuthErrorMessage } from "@/lib/auth/errors";
import { saveAuthSession } from "@/lib/auth/session";
import { validateEmail, validatePhoneNumber } from "@/lib/auth/validation";
import type { AuthSuccess } from "@/lib/types/auth";

type OtpChannel = "phone" | "email";
type Step = "input" | "otp";

/**
 * Page de connexion — Google, téléphone OTP ou email OTP.
 * Exportée pour les tests Jest / React Testing Library.
 */
export function LoginForm() {
  const router = useRouter();
  const [method, setMethod] = useState<AuthMethod>("email");
  const [step, setStep] = useState<Step>("input");
  const [phoneNumber, setPhoneNumber] = useState("+269");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [lastSentAt, setLastSentAt] = useState<number | null>(null);
  const [activeChannel, setActiveChannel] = useState<OtpChannel>("email");

  function resetOtpFlow() {
    setStep("input");
    setOtpCode("");
    setOtpMessage(null);
    setLastSentAt(null);
    setFieldError(null);
  }

  function handleMethodChange(next: AuthMethod) {
    setMethod(next);
    setError(null);
    setFieldError(null);
    resetOtpFlow();
  }

  function handleAuthSuccess(data: AuthSuccess) {
    saveAuthSession(data);
    router.replace("/");
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

  const requestPhoneOtp = useCallback(async () => {
    const validationError = validatePhoneNumber(phoneNumber);
    if (validationError) {
      setFieldError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    setFieldError(null);
    setOtpMessage(null);

    const result = await sendOtp(phoneNumber.trim());
    setLoading(false);

    if (!result.ok) {
      setError(mapAuthErrorMessage(result.error));
      return;
    }

    setActiveChannel("phone");
    setStep("otp");
    setLastSentAt(Date.now());
    setOtpMessage(result.data.detail);
    if (result.data.dev_code) {
      setOtpCode(result.data.dev_code);
    }
  }, [phoneNumber]);

  const requestEmailOtpFlow = useCallback(async () => {
    const validationError = validateEmail(email);
    if (validationError) {
      setFieldError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    setFieldError(null);
    setOtpMessage(null);

    const result = await requestEmailOtp(email);
    setLoading(false);

    if (!result.ok) {
      setError(mapAuthErrorMessage(result.error));
      return;
    }

    setActiveChannel("email");
    setStep("otp");
    setLastSentAt(Date.now());
    setOtpMessage(result.data.detail);
    if (result.data.dev_code) {
      setOtpCode(result.data.dev_code);
    }
  }, [email]);

  async function handleRequestOtp(event: React.FormEvent) {
    event.preventDefault();
    if (method === "phone") {
      await requestPhoneOtp();
    } else if (method === "email") {
      await requestEmailOtpFlow();
    }
  }

  async function handleVerifyOtp(code: string) {
    setLoading(true);
    setError(null);

    const result =
      activeChannel === "phone"
        ? await verifyOtp(phoneNumber.trim(), code)
        : await verifyEmailOtp(email.trim(), code);

    setLoading(false);

    if (!result.ok) {
      setError(mapAuthErrorMessage(result.error));
      return;
    }

    handleAuthSuccess(result.data);
  }

  async function handleResendOtp() {
    if (activeChannel === "phone") {
      await requestPhoneOtp();
    } else {
      await requestEmailOtpFlow();
    }
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
            Connectez-vous via Google, numéro de téléphone ou adresse email.
          </p>
        </header>

        <AuthMethodTabs active={method} onChange={handleMethodChange} />

        {method === "google" && (
          <GoogleAuthButton
            disabled={loading}
            onSuccess={(token) => void handleGoogleSuccess(token)}
            onError={setError}
          />
        )}

        {method === "phone" && step === "input" && (
          <form
            data-testid="phone-request-form"
            onSubmit={(e) => void handleRequestOtp(e)}
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
            {fieldError && (
              <p data-testid="phone-field-error" className="text-sm text-red-600">
                {fieldError}
              </p>
            )}
            <button
              type="submit"
              data-testid="phone-request-otp"
              disabled={loading}
              className="w-full rounded-full bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
            >
              {loading ? "Envoi…" : "Recevoir le code SMS"}
            </button>
          </form>
        )}

        {method === "email" && step === "input" && (
          <form
            data-testid="email-request-form"
            onSubmit={(e) => void handleRequestOtp(e)}
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
            {fieldError && (
              <p data-testid="email-field-error" className="text-sm text-red-600">
                {fieldError}
              </p>
            )}
            <button
              type="submit"
              data-testid="email-request-otp"
              disabled={loading}
              className="w-full rounded-full bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
            >
              {loading ? "Envoi…" : "Recevoir le code"}
            </button>
          </form>
        )}

        {(method === "phone" || method === "email") && step === "otp" && (
          <OtpVerifyForm
            targetLabel={activeChannel === "phone" ? "Téléphone" : "Email"}
            targetValue={
              activeChannel === "phone" ? phoneNumber.trim() : email.trim()
            }
            otpCode={otpCode}
            onOtpChange={setOtpCode}
            loading={loading}
            successMessage={otpMessage}
            lastSentAt={lastSentAt}
            onVerify={(code) => void handleVerifyOtp(code)}
            onResend={() => void handleResendOtp()}
            onChangeTarget={resetOtpFlow}
            submitLabel="Se connecter"
          />
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
