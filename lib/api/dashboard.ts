import { clientFetch } from "@/lib/api/client";
import type { ApiResult } from "@/lib/api/client";
import type { AuthUserProfile } from "@/lib/types/auth";

export type BuyerProfile = AuthUserProfile & {
  username: string;
  quartier: string;
  role: string;
};

export type BecomeSellerResponse = {
  detail: string;
  profile: BuyerProfile;
};

function authHeaders(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

export async function fetchBuyerProfile(
  accessToken: string,
): Promise<ApiResult<BuyerProfile>> {
  return clientFetch<BuyerProfile>("/api/buyer/profile", {
    method: "GET",
    headers: authHeaders(accessToken),
  });
}

export async function becomeSeller(
  accessToken: string,
): Promise<ApiResult<BecomeSellerResponse>> {
  return clientFetch<BecomeSellerResponse>("/api/buyer/become-seller", {
    method: "POST",
    headers: authHeaders(accessToken),
  });
}

export async function fetchSellerStats(
  accessToken: string,
): Promise<
  ApiResult<{
    total_annonces: number;
    annonces_vendues: number;
    estimation_gains: string;
  }>
> {
  return clientFetch("/api/seller/stats", {
    method: "GET",
    headers: authHeaders(accessToken),
  });
}
