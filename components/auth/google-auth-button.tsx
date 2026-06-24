"use client";

import { useGoogleOAuth } from "@react-oauth/google";
import { useEffect, useRef } from "react";

type Props = {
  onSuccess: (idToken: string) => void;
  onError: (message: string) => void;
  disabled?: boolean;
};

/** Évite GSI_LOGGER « initialize() called multiple times » (Strict Mode / remontages). */
let gsiInitializedClientId: string | null = null;

/**
 * Bouton Google OAuth (Gmail) — id_token pour le backend.
 * Un seul `google.accounts.id.initialize()` par clientId.
 */
export function GoogleAuthButton({ onSuccess, onError, disabled }: Props) {
  const btnContainerRef = useRef<HTMLDivElement>(null);
  const { clientId, scriptLoadedSuccessfully } = useGoogleOAuth();
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;

  useEffect(() => {
    if (!scriptLoadedSuccessfully || !clientId || !btnContainerRef.current) {
      return;
    }

    const googleId = window.google?.accounts?.id;
    if (!googleId) {
      return;
    }

    if (gsiInitializedClientId !== clientId) {
      googleId.initialize({
        client_id: clientId,
        callback: (credentialResponse) => {
          if (!credentialResponse?.credential) {
            onErrorRef.current(
              "Google n'a pas renvoyé de credential (id_token).",
            );
            return;
          }
          onSuccessRef.current(credentialResponse.credential);
        },
      });
      gsiInitializedClientId = clientId;
    }

    btnContainerRef.current.innerHTML = "";
    googleId.renderButton(btnContainerRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "rectangular",
    });
  }, [clientId, scriptLoadedSuccessfully]);

  return (
    <div
      data-testid="google-auth-button"
      ref={btnContainerRef}
      className={disabled ? "pointer-events-none opacity-50" : ""}
      style={{ minHeight: 40 }}
    />
  );
}
