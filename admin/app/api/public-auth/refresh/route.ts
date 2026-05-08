import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from "@/app/lib/auth-cookies";
import { verifyAuthToken } from "@/app/lib/auth-token";
import { getApiBaseUrlFromRequest } from "@/app/lib/backend-api";
import {
  isAllowedPublicRole,
  PUBLIC_ACCESS_COOKIE,
  PUBLIC_REFRESH_COOKIE,
} from "@/app/lib/public-auth-config";

export async function POST(request: Request) {
  const refreshToken = (await cookies()).get(PUBLIC_REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    return NextResponse.json({ message: "Missing refresh token" }, { status: 401 });
  }

  const response = await fetch(`${getApiBaseUrlFromRequest(request)}/users/refresh`, {
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
    nextResponse.cookies.delete(PUBLIC_ACCESS_COOKIE);
    nextResponse.cookies.delete(PUBLIC_REFRESH_COOKIE);
    return nextResponse;
  }

  const session = await verifyAuthToken(payload.accessToken, process.env.JWT_SECRET);
  if (!session || !isAllowedPublicRole(session.role)) {
    const nextResponse = NextResponse.json(
      { message: "Public account access required" },
      { status: 403 },
    );
    nextResponse.cookies.delete(PUBLIC_ACCESS_COOKIE);
    nextResponse.cookies.delete(PUBLIC_REFRESH_COOKIE);
    return nextResponse;
  }

  const nextResponse = NextResponse.json({
    accessToken: payload.accessToken,
  });
  nextResponse.cookies.set(
    PUBLIC_ACCESS_COOKIE,
    payload.accessToken,
    getAccessTokenCookieOptions(),
  );
  nextResponse.cookies.set(
    PUBLIC_REFRESH_COOKIE,
    payload.refreshToken,
    getRefreshTokenCookieOptions(),
  );

  return nextResponse;
}
