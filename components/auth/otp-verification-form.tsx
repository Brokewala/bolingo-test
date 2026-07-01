"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { AuthErrorAlert } from "@/components/auth/auth-error-alert";
import { OtpVerifyForm } from "@/components/auth/otp-verify-form";
import { resendOtp, verifyOtpUnified } from "@/lib/api/auth";
import { mapAuthErrorMessage } from "@/lib/auth/errors";
import { resolveDashboardPath } from "@/lib/auth/dashboard";
import { saveAuthSession } from "@/lib/auth/session";

function OtpVerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email")?.trim() || "";
  const phoneNumber = searchParams.get("phone_number")?.trim() || "";

  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [lastSentAt, setLastSentAt] = useState<number | null>(null);

  const channel = email ? "email" : "phone";
  const targetValue = email || phoneNumber;

  if (!targetValue) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center px-4 py-16">
        <main className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-zinc-600">
            Aucun email ou numéro fourni. Revenez depuis la page de connexion.
          </p>
          <Link href="/login" className="mt-6 inline-block text-sm font-medium underline">
            Retour connexion
          </Link>
        </main>
      </div>
    );
  }

  async function handleVerify(code: string) {
    setLoading(true);
    setError(null);

    const result = await verifyOtpUnified(
      channel === "email"
        ? { email, code }
        : { phone_number: phoneNumber, code },
    );
    setLoading(false);

    if (!result.ok) {
      setError(mapAuthErrorMessage(result.error));
      return;
    }

    saveAuthSession(result.data);
    router.replace(resolveDashboardPath(result.data.user));
  }

  async function handleResend() {
    setLoading(true);
    setError(null);

    const result = await resendOtp(
      channel === "email" ? { email } : { phone_number: phoneNumber },
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

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-50 px-4 py-16">
      <main className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <header className="mb-8 space-y-2">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            Bolingo
          </p>
          <h1 className="text-2xl font-semibold text-zinc-900">
            Activation du compte
          </h1>
          <p className="text-sm leading-6 text-zinc-600">
            Votre compte existe mais n&apos;est pas encore activé. Saisissez le
            code reçu par {channel === "email" ? "email" : "SMS"}.
          </p>
        </header>

        <OtpVerifyForm
          targetLabel={channel === "email" ? "Email" : "Téléphone"}
          targetValue={targetValue}
          otpCode={otpCode}
          onOtpChange={setOtpCode}
          loading={loading}
          successMessage={otpMessage}
          lastSentAt={lastSentAt}
          onVerify={(code) => void handleVerify(code)}
          onResend={() => void handleResend()}
          onChangeTarget={() => router.replace("/login")}
          submitLabel="Activer mon compte"
        />

        {error && (
          <div className="mt-6">
            <AuthErrorAlert message={error} />
          </div>
        )}
      </main>
    </div>
  );
}

export function OtpVerificationForm() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full flex-1 items-center justify-center text-sm text-zinc-500">
          Chargement…
        </div>
      }
    >
      <OtpVerificationContent />
    </Suspense>
  );
}
