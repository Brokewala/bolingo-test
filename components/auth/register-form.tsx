"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { AuthErrorAlert } from "@/components/auth/auth-error-alert";
import { AuthMethodTabs, type AuthMethod } from "@/components/auth/auth-method-tabs";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { OtpVerifyForm } from "@/components/auth/otp-verify-form";
import {
  RegistrationProfileForm,
  type RegistrationProfileValues,
} from "@/components/auth/registration-profile-form";
import {
  loginWithGoogleIdToken,
  requestEmailOtp,
  sendOtp,
  verifyEmailOtp,
  verifyOtp,
} from "@/lib/api/auth";
import { completeRegistration } from "@/lib/api/users";
import { mapAuthErrorMessage } from "@/lib/auth/errors";
import { saveAuthSession, updateAuthUser } from "@/lib/auth/session";
import { validateEmail, validatePhoneNumber } from "@/lib/auth/validation";
import type { AuthSuccess } from "@/lib/types/auth";

type RegisterStep = "method" | "otp" | "profile";
type OtpChannel = "phone" | "email";

/**
 * Page d'inscription — choix de méthode, OTP puis finalisation profil.
 */
export function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<RegisterStep>("method");
  const [method, setMethod] = useState<AuthMethod>("email");
  const [phoneNumber, setPhoneNumber] = useState("+269");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [authSession, setAuthSession] = useState<AuthSuccess | null>(null);
  const [activeChannel, setActiveChannel] = useState<OtpChannel>("email");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [lastSentAt, setLastSentAt] = useState<number | null>(null);

  function handleMethodChange(next: AuthMethod) {
    setMethod(next);
    setError(null);
    setFieldError(null);
    setStep("method");
    setOtpCode("");
    setOtpMessage(null);
    setLastSentAt(null);
  }

  function afterOtpAuth(data: AuthSuccess) {
    saveAuthSession(data);
    setAuthSession(data);
    setStep("profile");
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

    afterOtpAuth(result.data);
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

  async function handleStartOtp(event: React.FormEvent) {
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

    afterOtpAuth(result.data);
  }

  async function handleResendOtp() {
    if (activeChannel === "phone") {
      await requestPhoneOtp();
    } else {
      await requestEmailOtpFlow();
    }
  }

  async function handleProfileComplete(values: RegistrationProfileValues) {
    if (!authSession) {
      setError("Session expirée. Recommencez l'inscription.");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await completeRegistration(authSession.access, values);
    setLoading(false);

    if (!result.ok) {
      setError(mapAuthErrorMessage(result.error));
      return;
    }

    updateAuthUser(result.data.profile);
    router.replace("/");
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-50 px-4 py-16">
      <main className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <header className="mb-8 space-y-2">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            Bolingo
          </p>
          <h1 className="text-2xl font-semibold text-zinc-900">Inscription</h1>
          <p className="text-sm leading-6 text-zinc-600">
            Choisissez Google, téléphone ou email, validez l&apos;OTP puis
            complétez votre profil.
          </p>
        </header>

        {step === "method" && (
          <>
            <AuthMethodTabs active={method} onChange={handleMethodChange} />

            {method === "google" && (
              <GoogleAuthButton
                disabled={loading}
                onSuccess={(token) => void handleGoogleSuccess(token)}
                onError={setError}
              />
            )}

            {method === "phone" && (
              <form
                data-testid="register-phone-form"
                onSubmit={(e) => void handleStartOtp(e)}
                className="space-y-4"
              >
                <label className="block text-sm font-medium text-zinc-700">
                  Numéro de téléphone
                  <input
                    data-testid="register-phone-input"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+2693900000"
                    className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-zinc-400 focus:ring-2"
                  />
                </label>
                {fieldError && (
                  <p data-testid="register-phone-error" className="text-sm text-red-600">
                    {fieldError}
                  </p>
                )}
                <button
                  type="submit"
                  data-testid="register-phone-submit"
                  disabled={loading}
                  className="w-full rounded-full bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
                >
                  {loading ? "Envoi…" : "Recevoir le code SMS"}
                </button>
              </form>
            )}

            {method === "email" && (
              <form
                data-testid="register-email-form"
                onSubmit={(e) => void handleStartOtp(e)}
                className="space-y-4"
              >
                <label className="block text-sm font-medium text-zinc-700">
                  Adresse email
                  <input
                    data-testid="register-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nouveau@exemple.com"
                    className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-zinc-400 focus:ring-2"
                  />
                </label>
                {fieldError && (
                  <p data-testid="register-email-error" className="text-sm text-red-600">
                    {fieldError}
                  </p>
                )}
                <button
                  type="submit"
                  data-testid="register-email-submit"
                  disabled={loading}
                  className="w-full rounded-full bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
                >
                  {loading ? "Envoi…" : "Recevoir le code"}
                </button>
              </form>
            )}
          </>
        )}

        {step === "otp" && (
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
            onChangeTarget={() => {
              setStep("method");
              setOtpCode("");
              setOtpMessage(null);
              setLastSentAt(null);
            }}
            submitLabel="Valider l'inscription"
          />
        )}

        {step === "profile" && (
          <RegistrationProfileForm
            loading={loading}
            onSubmit={(values) => void handleProfileComplete(values)}
          />
        )}

        {error && (
          <div className="mt-6">
            <AuthErrorAlert message={error} />
          </div>
        )}

        <p className="mt-8 text-center text-sm text-zinc-600">
          Déjà inscrit ?{" "}
          <Link href="/login" className="font-medium text-zinc-900 underline">
            Se connecter
          </Link>
        </p>
      </main>
    </div>
  );
}
