"use client";

import { useCallback, useState } from "react";

import { isResendDisabled, ResendTimer } from "@/components/auth/resend-timer";
import { validateOtpCode } from "@/lib/auth/validation";

type Props = {
  targetLabel: string;
  targetValue: string;
  otpCode: string;
  onOtpChange: (code: string) => void;
  loading: boolean;
  successMessage: string | null;
  lastSentAt: number | null;
  onVerify: (code: string) => void;
  onResend: () => void;
  onChangeTarget: () => void;
  submitLabel?: string;
};

/**
 * Formulaire de saisie OTP partagé (téléphone et email).
 * Gère le timer de 60 s pour le renvoi anti-spam.
 */
export function OtpVerifyForm({
  targetLabel,
  targetValue,
  otpCode,
  onOtpChange,
  loading,
  successMessage,
  lastSentAt,
  onVerify,
  onResend,
  onChangeTarget,
  submitLabel = "Valider le code",
}: Props) {
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [, setTick] = useState(0);
  const handleTimerTick = useCallback(() => setTick((value) => value + 1), []);

  const resendDisabled = loading || isResendDisabled(lastSentAt);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const error = validateOtpCode(otpCode);
    if (error) {
      setFieldError(error);
      return;
    }
    setFieldError(null);
    onVerify(otpCode.trim());
  }

  return (
    <form
      data-testid="otp-verify-form"
      noValidate
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      {successMessage && (
        <p
          data-testid="otp-success-message"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
        >
          {successMessage}
        </p>
      )}

      <p className="text-sm text-zinc-600">
        Code envoyé à{" "}
        <strong>
          {targetLabel} : {targetValue}
        </strong>
      </p>

      <label className="block text-sm font-medium text-zinc-700">
        Code à 6 chiffres
        <input
          data-testid="otp-code-input"
          type="text"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          required
          value={otpCode}
          onChange={(event) =>
            onOtpChange(event.target.value.replace(/\D/g, ""))
          }
          placeholder="123456"
          className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm tracking-widest outline-none ring-zinc-400 focus:ring-2"
        />
      </label>

      {fieldError && (
        <p data-testid="otp-field-error" className="text-sm text-red-600">
          {fieldError}
        </p>
      )}

      <ResendTimer lastSentAt={lastSentAt} onTick={handleTimerTick} />

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          data-testid="otp-change-target"
          onClick={onChangeTarget}
          className="flex-1 rounded-full border border-zinc-300 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Modifier
        </button>
        <button
          type="button"
          data-testid="otp-resend-button"
          disabled={loading || resendDisabled}
          onClick={onResend}
          className="flex-1 rounded-full border border-zinc-300 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Renvoyer le code
        </button>
        <button
          type="submit"
          data-testid="otp-submit-button"
          disabled={loading || otpCode.length !== 6}
          className="flex-1 rounded-full bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {loading ? "Vérification…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
