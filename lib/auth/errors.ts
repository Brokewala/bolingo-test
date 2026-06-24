/** Traduit les messages d'erreur API en libellés UX clairs. */
export function mapAuthErrorMessage(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("expir") || lower.includes("introuvable")) {
    return "Code expiré. Demandez un nouveau code.";
  }
  if (lower.includes("verrouill") || lower.includes("trop de tentatives")) {
    return "Trop de tentatives, compte bloqué. Demandez un nouveau code.";
  }
  if (lower.includes("incorrect")) {
    return message;
  }
  if (lower.includes("patienter")) {
    return message;
  }

  return message;
}
