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
  const body = await request.json();

  const response = await fetch(`${getApiBaseUrlFromRequest(request)}/users/login`, {
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
    !isAllowedPublicRole(payload?.role)
  ) {
    return NextResponse.json(payload ?? { message: "Login failed" }, {
      status:
        payload?.role && !isAllowedPublicRole(payload.role)
          ? 403
          : response.status || 500,
    });
  }

  const session = await verifyAuthToken(payload.accessToken, process.env.JWT_SECRET);
  if (!session || !isAllowedPublicRole(session.role)) {
    return NextResponse.json({ message: "Public account access required" }, { status: 403 });
  }

  const nextResponse = NextResponse.json({
    success: true,
    role: payload.role ?? session.role,
    user: payload.user ?? null,
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
