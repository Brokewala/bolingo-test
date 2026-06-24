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
  registerUser,
  resendOtp,
  verifyOtpUnified,
} from "@/lib/api/auth";
import { completeRegistration } from "@/lib/api/users";
import { mapAuthErrorMessage } from "@/lib/auth/errors";
import { saveAuthSession, updateAuthUser } from "@/lib/auth/session";
import { validateEmail, validatePhoneNumber } from "@/lib/auth/validation";
import type { AuthSuccess, RegisterPendingSuccess } from "@/lib/types/auth";

type RegisterStep = "method" | "otp" | "profile";
type OtpChannel = "phone" | "email";

/**
 * Page d'inscription — POST /auth/register/, OTP, profil.
 */
export function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<RegisterStep>("method");
  const [method, setMethod] = useState<AuthMethod>("email");
  const [phoneNumber, setPhoneNumber] = useState("+269");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  function applyPendingOtp(result: RegisterPendingSuccess, channel: OtpChannel) {
    setActiveChannel(channel);
    setStep("otp");
    setLastSentAt(Date.now());
    setOtpMessage(result.detail);
    if (result.dev_code) {
      setOtpCode(result.dev_code);
    }
  }

  async function handleGoogleSuccess(idToken: string) {
    setLoading(true);
    setError(null);

    const result = await registerUser({
      method: "GMAIL",
      id_token: idToken,
    });
    setLoading(false);

    if (!result.ok) {
      setError(mapAuthErrorMessage(result.error));
      return;
    }

    if (result.kind === "jwt") {
      afterOtpAuth(result.data);
      return;
    }
  }

  const submitEmailRegister = useCallback(async () => {
    const validationError = validateEmail(email);
    if (validationError) {
      setFieldError(validationError);
      return;
    }
    if (password.length < 8) {
      setFieldError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setLoading(true);
    setError(null);
    setFieldError(null);

    const result = await registerUser({
      method: "EMAIL",
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (!result.ok) {
      setError(mapAuthErrorMessage(result.error));
      return;
    }

    if (result.kind === "pending") {
      applyPendingOtp(result.data, "email");
    }
  }, [email, password]);

  const submitPhoneRegister = useCallback(async () => {
    const validationError = validatePhoneNumber(phoneNumber);
    if (validationError) {
      setFieldError(validationError);
      return;
    }
    if (password.length < 8) {
      setFieldError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setLoading(true);
    setError(null);
    setFieldError(null);

    const result = await registerUser({
      method: "PHONE",
      phone_number: phoneNumber.trim(),
      password,
    });
    setLoading(false);

    if (!result.ok) {
      setError(mapAuthErrorMessage(result.error));
      return;
    }

    if (result.kind === "pending") {
      applyPendingOtp(result.data, "phone");
    }
  }, [phoneNumber, password]);

  async function handleStartRegister(event: React.FormEvent) {
    event.preventDefault();
    if (method === "phone") {
      await submitPhoneRegister();
    } else if (method === "email") {
      await submitEmailRegister();
    }
  }

  async function handleVerifyOtp(code: string) {
    setLoading(true);
    setError(null);

    const result = await verifyOtpUnified(
      activeChannel === "phone"
        ? { phone_number: phoneNumber.trim(), code }
        : { email: email.trim(), code },
    );
    setLoading(false);

    if (!result.ok) {
      setError(mapAuthErrorMessage(result.error));
      return;
    }

    afterOtpAuth(result.data);
  }

  async function handleResendOtp() {
    setLoading(true);
    setError(null);

    const result = await resendOtp(
      activeChannel === "phone"
        ? { phone_number: phoneNumber.trim() }
        : { email: email.trim() },
    );
    setLoading(false);

    if (!result.ok) {
      setError(mapAuthErrorMessage(result.error));
      return;
    }

    setLastSentAt(Date.now());
    setOtpMessage(result.data.detail);
    if (result.data.dev_code) {
      setOtpCode(result.data.dev_code);
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
            Créez votre compte, validez l&apos;OTP (email/SMS) puis complétez
            votre profil.
          </p>
        </header>

        {step === "method" && (
          <>
            <AuthMethodTabs active={method} onChange={handleMethodChange} />

            {/* Monté en permanence pour éviter GSI re-initialize au changement d'onglet */}
            <div className={method === "google" ? "mb-0" : "hidden"} aria-hidden={method !== "google"}>
              <GoogleAuthButton
                disabled={loading || method !== "google"}
                onSuccess={(token) => void handleGoogleSuccess(token)}
                onError={setError}
              />
            </div>

            {method === "phone" && (
              <form
                data-testid="register-phone-form"
                noValidate
                onSubmit={(e) => void handleStartRegister(e)}
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
                <label className="block text-sm font-medium text-zinc-700">
                  Mot de passe
                  <input
                    data-testid="register-password-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    autoComplete="new-password"
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
                  {loading ? "Inscription…" : "S'inscrire et recevoir le SMS"}
                </button>
              </form>
            )}

            {method === "email" && (
              <form
                data-testid="register-email-form"
                noValidate
                onSubmit={(e) => void handleStartRegister(e)}
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
                <label className="block text-sm font-medium text-zinc-700">
                  Mot de passe
                  <input
                    data-testid="register-password-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    autoComplete="new-password"
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
                  {loading ? "Inscription…" : "S'inscrire et recevoir le code"}
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
