import { NextResponse } from "next/server";

import {
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from "@/app/lib/auth-cookies";
import { verifyAuthToken } from "@/app/lib/auth-token";

const getApiBaseUrl = (request: Request) => {
  const candidates = [
    process.env.API_URL,
    process.env.NEXT_PUBLIC_API_URL,
    new URL("/api/v1", request.url).toString(),
  ]
    .map((value) => value?.replace(/\/$/, ""))
    .filter(Boolean);

  return candidates[0] || new URL("/api/v1", request.url).toString();
};

export async function POST(request: Request) {
  const body = await request.json();

  const response = await fetch(`${getApiBaseUrl(request)}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);
  if (
    !response.ok ||
    !payload?.accessToken ||
    !payload?.refreshToken ||
    payload?.role !== "admin"
  ) {
    return NextResponse.json(payload ?? { message: "Login failed" }, {
      status:
        payload?.role && payload.role !== "admin"
          ? 403
          : response.status || 500,
    });
  }

  const session = await verifyAuthToken(
    payload.accessToken,
    process.env.JWT_SECRET,
  );
  if (!session || session.role !== "admin") {
    return NextResponse.json({ message: "Admin access required" }, { status: 403 });
  }

  const nextResponse = NextResponse.json({ success: true });
  nextResponse.cookies.set(
    "admin_token",
    payload.accessToken,
    getAccessTokenCookieOptions(),
  );
  nextResponse.cookies.set(
    "refresh_token",
    payload.refreshToken,
    getRefreshTokenCookieOptions(),
  );

  return nextResponse;
}
