/** Délai minimum entre deux envois OTP (aligné backend). */
export const OTP_RESEND_COOLDOWN_SECONDS = 60;

/** Îles des Comores — choix obligatoire à l'inscription. */
export const COMOROS_ISLANDS = [
  { value: "NGAZIDJA", label: "Ngazidja (Grande Comore)" },
  { value: "MWALI", label: "Mwali (Mohéli)" },
  { value: "NDZUANI", label: "Ndzuani (Anjouan)" },
] as const;

export type ComorosIsland = (typeof COMOROS_ISLANDS)[number]["value"];
