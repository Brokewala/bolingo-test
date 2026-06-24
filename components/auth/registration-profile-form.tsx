"use client";

import { useState } from "react";

import { COMOROS_ISLANDS } from "@/lib/constants/auth";

export type RegistrationProfileValues = {
  prenom: string;
  nom: string;
  ile: string;
  ville: string;
};

type Props = {
  loading: boolean;
  onSubmit: (values: RegistrationProfileValues) => void;
};

/**
 * Étape finale d'inscription : prénom, nom, île et ville obligatoires.
 */
export function RegistrationProfileForm({ loading, onSubmit }: Props) {
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [ile, setIle] = useState("");
  const [ville, setVille] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationProfileValues, string>>>({});

  function validate(): boolean {
    const next: Partial<Record<keyof RegistrationProfileValues, string>> = {};

    if (!prenom.trim()) next.prenom = "Le prénom est obligatoire.";
    if (!nom.trim()) next.nom = "Le nom est obligatoire.";
    if (!ile) next.ile = "Veuillez sélectionner une île.";
    if (!ville.trim()) next.ville = "La ville est obligatoire.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validate()) return;

    onSubmit({
      prenom: prenom.trim(),
      nom: nom.trim(),
      ile,
      ville: ville.trim(),
    });
  }

  return (
    <form
      data-testid="registration-profile-form"
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-zinc-900">
          Finalisez votre profil
        </h2>
        <p className="text-sm text-zinc-600">
          Complétez les informations obligatoires pour accéder à Bolingo.
        </p>
      </header>

      <label className="block text-sm font-medium text-zinc-700">
        Prénom
        <input
          data-testid="register-prenom"
          type="text"
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
          className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-zinc-400 focus:ring-2"
        />
        {errors.prenom && (
          <span data-testid="register-prenom-error" className="mt-1 block text-xs text-red-600">
            {errors.prenom}
          </span>
        )}
      </label>

      <label className="block text-sm font-medium text-zinc-700">
        Nom
        <input
          data-testid="register-nom"
          type="text"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-zinc-400 focus:ring-2"
        />
        {errors.nom && (
          <span data-testid="register-nom-error" className="mt-1 block text-xs text-red-600">
            {errors.nom}
          </span>
        )}
      </label>

      <label className="block text-sm font-medium text-zinc-700">
        Île
        <select
          data-testid="register-ile"
          value={ile}
          onChange={(e) => setIle(e.target.value)}
          className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-zinc-400 focus:ring-2"
        >
          <option value="">— Choisir une île —</option>
          {COMOROS_ISLANDS.map((island) => (
            <option key={island.value} value={island.value}>
              {island.label}
            </option>
          ))}
        </select>
        {errors.ile && (
          <span data-testid="register-ile-error" className="mt-1 block text-xs text-red-600">
            {errors.ile}
          </span>
        )}
      </label>

      <label className="block text-sm font-medium text-zinc-700">
        Ville
        <input
          data-testid="register-ville"
          type="text"
          value={ville}
          onChange={(e) => setVille(e.target.value)}
          className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ring-zinc-400 focus:ring-2"
        />
        {errors.ville && (
          <span data-testid="register-ville-error" className="mt-1 block text-xs text-red-600">
            {errors.ville}
          </span>
        )}
      </label>

      <button
        type="submit"
        data-testid="register-profile-submit"
        disabled={loading}
        className="w-full rounded-full bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        {loading ? "Enregistrement…" : "Terminer l'inscription"}
      </button>
    </form>
  );
}
