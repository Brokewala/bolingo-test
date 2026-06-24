type Props = {
  message: string;
};

/** Bandeau d'erreur accessible (messages API mappés côté page). */
export function AuthErrorAlert({ message }: Props) {
  return (
    <section
      role="alert"
      aria-live="polite"
      data-testid="auth-error"
      className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
    >
      <h2 className="font-semibold">Erreur</h2>
      <p className="mt-2">{message}</p>
    </section>
  );
}
