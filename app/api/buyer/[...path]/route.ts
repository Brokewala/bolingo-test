import { NextRequest, NextResponse } from "next/server";

import {
  DJANGO_API_URL,
  DJANGO_UNAVAILABLE_MESSAGE,
} from "@/lib/api/config";

type RouteContext = { params: Promise<{ path: string[] }> };

async function proxyToDjango(
  request: NextRequest,
  context: RouteContext,
  prefix: string,
) {
  const { path } = await context.params;
  const subPath = path.join("/");
  const search = request.nextUrl.search;
  const url = `${DJANGO_API_URL}/api/${prefix}/${subPath}/${search}`;

  const headers = new Headers();
  const authorization = request.headers.get("authorization");
  if (authorization) {
    headers.set("Authorization", authorization);
  }

  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  let body: BodyInit | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    body = await request.arrayBuffer();
  }

  try {
    const response = await fetch(url, {
      method: request.method,
      headers,
      body,
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

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyToDjango(request, context, "buyer");
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyToDjango(request, context, "buyer");
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxyToDjango(request, context, "buyer");
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxyToDjango(request, context, "buyer");
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyToDjango(request, context, "buyer");
}
