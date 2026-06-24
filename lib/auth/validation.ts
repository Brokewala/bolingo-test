/** Regex email — format standard pour la validation côté client. */
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Numéro international E.164 simplifié : + suivi de 8 à 19 chiffres.
 * Aligné sur la validation backend (min 8, max 20 caractères).
 */
const PHONE_REGEX = /^\+[1-9]\d{7,18}$/;

export function validateEmail(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return "L'adresse email est obligatoire.";
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return "Format email invalide (ex : utilisateur@exemple.com).";
  }
  return null;
}

export function validatePhoneNumber(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return "Le numéro de téléphone est obligatoire.";
  }
  if (!PHONE_REGEX.test(trimmed)) {
    return "Format invalide. Utilisez le format international (ex : +2693900000).";
  }
  return null;
}

export function validateOtpCode(value: string): string | null {
  const trimmed = value.trim();
  if (!/^\d{6}$/.test(trimmed)) {
    return "Le code OTP doit contenir exactement 6 chiffres.";
  }
  return null;
}
