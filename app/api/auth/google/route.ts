import { NextResponse } from "next/server";

/** URL Django lue côté serveur (évite CORS et problèmes IPv6 localhost sur Windows). */
const DJANGO_API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:8000";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { detail: "Corps JSON invalide." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(`${DJANGO_API_URL}/api/auth/google/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      {
        detail:
          "Impossible de joindre le backend Django. Vérifiez que `python manage.py runserver` est lancé sur le port 8000.",
      },
      { status: 503 },
    );
  }
}
