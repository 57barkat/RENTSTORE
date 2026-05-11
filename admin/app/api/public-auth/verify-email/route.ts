import { NextResponse } from "next/server";

import { getApiBaseUrlFromRequest } from "@/app/lib/backend-api";

export async function POST(request: Request) {
  const body = await request.json();

  const response = await fetch(
    `${getApiBaseUrlFromRequest(request)}/users/verify-email`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    },
  );

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    return NextResponse.json(payload ?? { message: "Email verification failed" }, {
      status: response.status || 500,
    });
  }

  return NextResponse.json({
    success: true,
    email: payload?.email,
    role: payload?.role,
    user: payload?.user ?? null,
  });
}
