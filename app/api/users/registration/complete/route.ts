import { NextResponse } from "next/server";

import {
  DJANGO_API_URL,
  DJANGO_UNAVAILABLE_MESSAGE,
} from "@/lib/api/config";

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return NextResponse.json(
      { detail: "Token JWT manquant." },
      { status: 401 },
    );
  }

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
    const response = await fetch(`${DJANGO_API_URL}/api/users/registration/complete/`, {
      method: "POST",
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { detail: DJANGO_UNAVAILABLE_MESSAGE },
      { status: 503 },
    );
  }
}
