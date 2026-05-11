import { NextResponse } from "next/server";

import { verifyAuthToken } from "@/app/lib/auth-token";
import { getApiBaseUrlFromRequest } from "@/app/lib/backend-api";
import { isAllowedPublicRole } from "@/app/lib/public-auth-config";

export async function POST(request: Request) {
  const body = await request.json();

  const response = await fetch(`${getApiBaseUrlFromRequest(request)}/users/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);

  const role = payload?.role ?? payload?.user?.role;

  if (!response.ok || !isAllowedPublicRole(role)) {
    return NextResponse.json(payload ?? { message: "Signup failed" }, {
      status:
        role && !isAllowedPublicRole(role)
          ? 403
          : response.status || 500,
    });
  }

  if (payload?.accessToken) {
    const session = await verifyAuthToken(
      payload.accessToken,
      process.env.JWT_SECRET,
    );
    if (!session || !isAllowedPublicRole(session.role)) {
      return NextResponse.json(
        { message: "Public account access required" },
        { status: 403 },
      );
    }
  }

  return NextResponse.json({
    success: true,
    verificationRequired: true,
    email: payload?.email ?? payload?.user?.email ?? body.email,
    user: payload.user ?? null,
    role,
  });
}
