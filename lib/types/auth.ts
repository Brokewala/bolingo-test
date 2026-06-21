/** Profil utilisateur renvoyé par POST /api/auth/google/ */
export type UserProfile = {
  id: number;
  google_id: string | null;
  phone_number: string | null;
  first_name: string;
  last_name: string;
  avatar_url: string;
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
};

/** Réponse succès de POST /api/auth/google/ */
export type GoogleAuthSuccess = {
  access: string;
  refresh: string;
  is_new_user: boolean;
  user: UserProfile;
};

/** Réponse erreur Django Ninja */
export type ApiError = {
  detail: string;
};

export type AuthResult =
  | { ok: true; data: GoogleAuthSuccess }
  | { ok: false; status: number; error: string };

export type LogoutSuccess = {
  detail: string;
};
