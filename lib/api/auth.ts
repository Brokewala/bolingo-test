import { clientFetch } from "@/lib/api/client";
import type {
  AuthResult,
  AuthSuccess,
  SendOTPResult,
  SwitchDashboardResult,
  VerifyOTPResult,
} from "@/lib/types/auth";

const NETWORK_ERROR =
  "Connexion au serveur impossible. Vérifiez que Next.js et Django sont démarrés.";

export async function loginWithGoogleIdToken(
  idToken: string,
): Promise<AuthResult> {
  const result = await clientFetch<AuthSuccess>("/api/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token: idToken }),
  });

  if (!result.ok) {
    return {
      ok: false,
      status: result.status,
      error: result.status === 0 ? NETWORK_ERROR : result.error,
    };
  }

  return { ok: true, data: result.data };
}

export async function sendOtp(phoneNumber: string): Promise<SendOTPResult> {
  const result = await clientFetch<{ detail: string; expires_in_seconds: number }>(
    "/api/auth/send-otp",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone_number: phoneNumber }),
    },
  );

  if (!result.ok) {
    return {
      ok: false,
      status: result.status,
      error: result.status === 0 ? NETWORK_ERROR : result.error,
    };
  }

  return { ok: true, data: result.data };
}

export async function verifyOtp(
  phoneNumber: string,
  code: string,
): Promise<VerifyOTPResult> {
  const result = await clientFetch<AuthSuccess>("/api/auth/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone_number: phoneNumber, code }),
  });

  if (!result.ok) {
    return {
      ok: false,
      status: result.status,
      error: result.status === 0 ? NETWORK_ERROR : result.error,
    };
  }

  return { ok: true, data: result.data };
}

export async function switchDashboard(
  accessToken: string,
): Promise<SwitchDashboardResult> {
  const result = await clientFetch<{ detail: string; user: AuthSuccess["user"] }>(
    "/api/auth/switch-dashboard",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!result.ok) {
    return {
      ok: false,
      status: result.status,
      error: result.status === 0 ? NETWORK_ERROR : result.error,
    };
  }

  return { ok: true, data: result.data };
}
