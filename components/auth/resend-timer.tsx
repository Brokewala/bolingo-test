"use client";

import { useEffect, useRef, useState } from "react";

import { OTP_RESEND_COOLDOWN_SECONDS } from "@/lib/constants/auth";

type Props = {
  /** Timestamp (ms) du dernier envoi OTP — déclenche le compte à rebours. */
  lastSentAt: number | null;
  onResendReady?: () => void;
  /** Force le parent à se re-rendre chaque seconde (état bouton renvoi). */
  onTick?: () => void;
};

/**
 * Compte à rebours visuel de 60 secondes pour le bouton « Renvoyer le code ».
 * Exporte l'état via data-testid pour les tests automatisés.
 */
export function ResendTimer({ lastSentAt, onResendReady, onTick }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  useEffect(() => {
    if (!lastSentAt) {
      setSecondsLeft(0);
      return;
    }

    function tick() {
      const elapsed = Math.floor((Date.now() - lastSentAt!) / 1000);
      const remaining = Math.max(0, OTP_RESEND_COOLDOWN_SECONDS - elapsed);
      setSecondsLeft(remaining);
      onTickRef.current?.();

      if (remaining === 0) {
        onResendReady?.();
      }
    }

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [lastSentAt, onResendReady]);

  if (!lastSentAt || secondsLeft <= 0) {
    return null;
  }

  return (
    <p
      data-testid="otp-resend-timer"
      className="text-center text-xs text-zinc-500"
      aria-live="polite"
    >
      Renvoi possible dans{" "}
      <span data-testid="otp-resend-seconds">{secondsLeft}</span>s
    </p>
  );
}

/** Indique si le bouton renvoyer doit rester désactivé. */
export function isResendDisabled(lastSentAt: number | null): boolean {
  if (!lastSentAt) return false;
  const elapsed = Math.floor((Date.now() - lastSentAt) / 1000);
  return elapsed < OTP_RESEND_COOLDOWN_SECONDS;
}

export { OTP_RESEND_COOLDOWN_SECONDS };
