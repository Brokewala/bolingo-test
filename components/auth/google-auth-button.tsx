"use client";

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";

type Props = {
  onSuccess: (idToken: string) => void;
  onError: (message: string) => void;
  disabled?: boolean;
};

/** Bouton Google OAuth (Gmail) — wrapper autour de @react-oauth/google. */
export function GoogleAuthButton({ onSuccess, onError, disabled }: Props) {
  return (
    <div
      data-testid="google-auth-button"
      className={disabled ? "pointer-events-none opacity-50" : ""}
    >
      <GoogleLogin
        onSuccess={(response: CredentialResponse) => {
          if (!response.credential) {
            onError("Google n'a pas renvoyé de credential (id_token).");
            return;
          }
          onSuccess(response.credential);
        }}
        onError={() =>
          onError("Connexion Google annulée ou échouée côté client.")
        }
        useOneTap={false}
        theme="outline"
        size="large"
        text="continue_with"
        shape="rectangular"
      />
    </div>
  );
}
