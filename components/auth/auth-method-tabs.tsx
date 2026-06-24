export type AuthMethod = "google" | "phone" | "email";

type Props = {
  active: AuthMethod;
  onChange: (method: AuthMethod) => void;
};

const TABS: { id: AuthMethod; label: string }[] = [
  { id: "phone", label: "Téléphone" },
  { id: "email", label: "Email" },
  { id: "google", label: "Google" },
];

/** Onglets de sélection de la méthode d'authentification hybride. */
export function AuthMethodTabs({ active, onChange }: Props) {
  return (
    <div
      data-testid="auth-method-tabs"
      className="mb-6 flex rounded-lg border border-zinc-200 p-1"
      role="tablist"
    >
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          data-testid={`auth-tab-${tab.id}`}
          onClick={() => onChange(tab.id)}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
            active === tab.id
              ? "bg-zinc-900 text-white"
              : "text-zinc-600 hover:bg-zinc-50"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
