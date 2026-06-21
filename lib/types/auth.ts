/** Profil utilisateur renvoyé par Django Ninja */
export type UserProfile = {
  id: number;
  google_id: string | null;
  phone_number: string | null;
  first_name: string;
  last_name: string;
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
