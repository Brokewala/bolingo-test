import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-4">
      <main className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">Bolingo Test</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          Projet Next.js pour valider le flux Google Sign-In → Django Ninja.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition hover:bg-zinc-700"
        >
          Tester la connexion Google
        </Link>
      </main>
    </div>
  );
}
