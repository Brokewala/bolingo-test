import { clientFetch } from "@/lib/api/client";
import type {
  AuthResult,
  AuthSuccess,
  RegisterPayload,
  RegisterPendingSuccess,
  RegisterResult,
  ResendOTPResult,
  SendOTPResult,
  SwitchDashboardResult,
  VerifyOTPResult,
} from "@/lib/types/auth";

const NETWORK_ERROR =
  "Connexion au serveur impossible. Vérifiez que Next.js et Django sont démarrés.";

function mapError(status: number, error: string): string {
  return status === 0 ? NETWORK_ERROR : error;
}

/** POST /api/auth/register/ — Gmail (JWT) ou Email/Phone (OTP, 201). */
export async function registerUser(payload: RegisterPayload): Promise<RegisterResult> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    return { ok: false, status: response.status, error: NETWORK_ERROR };
  }

  if (!response.ok) {
    const detail =
      typeof data === "object" &&
      data !== null &&
      "detail" in data &&
      typeof (data as { detail: unknown }).detail === "string"
        ? (data as { detail: string }).detail
        : `Erreur HTTP ${response.status}`;
    return { ok: false, status: response.status, error: detail };
  }

  if (response.status === 201) {
    return {
      ok: true,
      kind: "pending",
      data: data as RegisterPendingSuccess,
    };
  }

  return {
    ok: true,
    kind: "jwt",
    data: data as AuthSuccess,
  };
}

/** POST /api/auth/resend-otp/ — renvoi OTP (compte inactif). */
export async function resendOtp(payload: {
  email?: string;
  phone_number?: string;
}): Promise<ResendOTPResult> {
  const result = await clientFetch<RegisterPendingSuccess>(
    "/api/auth/resend-otp",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  if (!result.ok) {
    return {
      ok: false,
      status: result.status,
      error: mapError(result.status, result.error),
    };
  }

  return { ok: true, data: result.data };
}

/** POST /api/auth/verify-otp/ — activation compte + JWT. */
export async function verifyOtpUnified(payload: {
  email?: string;
  phone_number?: string;
  code: string;
}): Promise<VerifyOTPResult> {
  const result = await clientFetch<AuthSuccess>("/api/auth/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!result.ok) {
    return {
      ok: false,
      status: result.status,
      error: mapError(result.status, result.error),
    };
  }

  return { ok: true, data: result.data };
}

/** POST /api/auth/login/ — connexion mot de passe (sans OTP). */
export async function loginWithPassword(payload: {
  email?: string;
  phone_number?: string;
  password: string;
}): Promise<AuthResult> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    return { ok: false, status: response.status, error: NETWORK_ERROR };
  }

  if (response.status === 403) {
    const body = data as Record<string, unknown>;
    if (body.code === "ACCOUNT_NOT_VERIFIED") {
      return {
        ok: false,
        status: 403,
        error: String(body.message ?? body.detail ?? "Compte non activé."),
        accountNotVerified: data as import("@/lib/types/auth").AccountNotVerified,
      };
    }
  }

  if (!response.ok) {
    const detail =
      typeof data === "object" &&
      data !== null &&
      "detail" in data &&
      typeof (data as { detail: unknown }).detail === "string"
        ? (data as { detail: string }).detail
        : `Erreur HTTP ${response.status}`;
    return {
      ok: false,
      status: response.status,
      error: mapError(response.status, detail),
    };
  }

  return { ok: true, data: data as AuthSuccess };
}

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
      error: mapError(result.status, result.error),
    };
  }

  return { ok: true, data: result.data };
}

/** @deprecated Utiliser resendOtp — alias legacy send-otp */
export async function sendOtp(phoneNumber: string): Promise<SendOTPResult> {
  const result = await resendOtp({ phone_number: phoneNumber });
  if (!result.ok) {
    return { ok: false, status: result.status, error: result.error };
  }
  return {
    ok: true,
    data: {
      detail: result.data.detail,
      expires_in_seconds: result.data.expires_in_seconds,
      dev_code: result.data.dev_code,
    },
  };
}

/** @deprecated Utiliser verifyOtpUnified */
export async function verifyOtp(
  phoneNumber: string,
  code: string,
): Promise<VerifyOTPResult> {
  return verifyOtpUnified({ phone_number: phoneNumber, code });
}

/** @deprecated Utiliser registerUser ou resendOtp */
export async function requestEmailOtp(
  email: string,
): Promise<import("@/lib/types/auth").EmailRequestOTPResult> {
  const result = await resendOtp({ email: email.trim() });
  if (!result.ok) {
    return { ok: false, status: result.status, error: result.error };
  }
  return { ok: true, data: result.data };
}

/** @deprecated Utiliser verifyOtpUnified */
export async function verifyEmailOtp(
  email: string,
  code: string,
): Promise<VerifyOTPResult> {
  return verifyOtpUnified({ email: email.trim(), code: code.trim() });
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
      error: mapError(result.status, result.error),
    };
  }

  return { ok: true, data: result.data };
}
