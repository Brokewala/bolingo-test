import { clientFetch } from "@/lib/api/client";
import type { ApiResult } from "@/lib/api/client";
import type {
  LogoutSuccess,
  RegistrationCompletePayload,
  RegistrationCompleteSuccess,
  UserOut,
} from "@/lib/types/auth";

function authHeaders(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

/** GET /api/users/me — profil utilisateur connecté (JWT requis) */
export async function fetchCurrentUser(
  accessToken: string,
): Promise<ApiResult<UserOut>> {
  return clientFetch<UserOut>("/api/users/me", {
    method: "GET",
    headers: authHeaders(accessToken),
    cache: "no-store",
  });
}

/** POST /api/users/logout — blacklist du refresh token (JWT requis) */
export async function logoutUser(
  accessToken: string,
  refreshToken: string,
): Promise<ApiResult<LogoutSuccess>> {
  return clientFetch<LogoutSuccess>("/api/users/logout", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

/** POST /api/users/registration/complete — finalisation profil après OTP */
export async function completeRegistration(
  accessToken: string,
  payload: RegistrationCompletePayload,
): Promise<ApiResult<RegistrationCompleteSuccess>> {
  return clientFetch<RegistrationCompleteSuccess>(
    "/api/users/registration/complete",
    {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify(payload),
    },
  );
}
