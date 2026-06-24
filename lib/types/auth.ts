/** Profil utilisateur avec rôles RBAC (auth OTP / Google) */
export type AuthUserProfile = {
  id: number;
  google_id: string | null;
  phone_number: string | null;
  first_name: string;
  last_name: string;
  avatar_url: string;
  quartier?: string;
  is_buyer: boolean;
  is_seller: boolean;
  is_staff: boolean;
  roles: string[];
};

/** Profil utilisateur renvoyé par GET /api/users/me */
export type UserOut = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  google_id: string | null;
  avatar_url: string;
  role: string;
  is_buyer: boolean;
  is_seller: boolean;
  is_staff: boolean;
  is_admin: boolean;
  roles: string[];
};

/** Réponse succès auth (Google ou OTP) */
export type AuthSuccess = {
  access: string;
  refresh: string;
  is_new_user: boolean;
  user: AuthUserProfile;
};

export type SendOTPSuccess = {
  detail: string;
  expires_in_seconds: number;
  dev_code?: string | null;
};

export type RegisterPendingSuccess = {
  detail: string;
  method: string;
  cible: string;
  est_actif: boolean;
  expires_in_seconds: number;
  dev_code?: string | null;
};

export type RegisterPayload = {
  method: "GMAIL" | "EMAIL" | "PHONE";
  id_token?: string;
  email?: string;
  phone_number?: string;
  password?: string;
};

export type RegisterResult =
  | { ok: true; kind: "jwt"; data: AuthSuccess }
  | { ok: true; kind: "pending"; data: RegisterPendingSuccess }
  | { ok: false; status: number; error: string };

export type ResendOTPResult =
  | { ok: true; data: RegisterPendingSuccess }
  | { ok: false; status: number; error: string };

export type RegistrationCompletePayload = {
  prenom: string;
  nom: string;
  ile: string;
  ville: string;
  quartier?: string | null;
};

export type RegistrationCompleteSuccess = {
  detail: string;
  profile: AuthUserProfile;
};

export type SwitchDashboardSuccess = {
  detail: string;
  user: AuthUserProfile;
};

/** Réponse erreur Django Ninja */
export type ApiError = {
  detail: string;
};

export type AuthResult =
  | { ok: true; data: AuthSuccess }
  | { ok: false; status: number; error: string };

export type SendOTPResult =
  | { ok: true; data: SendOTPSuccess }
  | { ok: false; status: number; error: string };

export type EmailRequestOTPResult =
  | { ok: true; data: RegisterPendingSuccess }
  | { ok: false; status: number; error: string };

export type VerifyOTPResult = AuthResult;

export type SwitchDashboardResult =
  | { ok: true; data: SwitchDashboardSuccess }
  | { ok: false; status: number; error: string };

export type LogoutSuccess = {
  detail: string;
};

/** @deprecated Utiliser AuthSuccess */
export type GoogleAuthSuccess = AuthSuccess;

/** @deprecated Utiliser AuthUserProfile */
export type UserProfile = AuthUserProfile;

export type DashboardKind = "admin" | "seller" | "buyer";
