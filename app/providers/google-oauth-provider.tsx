"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

/**
 * Enveloppe l'application avec le contexte Google OAuth.
 * NEXT_PUBLIC_GOOGLE_CLIENT_ID doit être un Client ID de type "Web application"
 * (Google Cloud Console → APIs & Services → Credentials).
 */
export function GoogleOAuthProviderWrapper({ children }: Props) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    return (
      <div className="mx-auto max-w-lg p-6 text-center text-sm text-red-600">
        Variable manquante :{" "}
        <code className="rounded bg-red-50 px-1">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code>
        . Copiez <code>.env.local.example</code> vers{" "}
        <code>.env.local</code>.
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>
  );
}
