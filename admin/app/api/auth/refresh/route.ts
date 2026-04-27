import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from "@/app/lib/auth-cookies";

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
  const refreshToken = (await cookies()).get("refresh_token")?.value;
  if (!refreshToken) {
    return NextResponse.json({ message: "Missing refresh token" }, { status: 401 });
  }

  const response = await fetch(`${getApiBaseUrl(request)}/users/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.accessToken || !payload?.refreshToken) {
    const nextResponse = NextResponse.json(
      payload ?? { message: "Refresh failed" },
      { status: response.status || 401 },
    );
    nextResponse.cookies.delete("admin_token");
    nextResponse.cookies.delete("refresh_token");
    return nextResponse;
  }

  const nextResponse = NextResponse.json({
    accessToken: payload.accessToken,
  });
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
