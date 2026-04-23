import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { verifyAuthToken } from "@/app/lib/auth-token";
import { isProtectedRoute } from "@/app/lib/route-constants";

const FRONTEND_SECRET = process.env.MY_APP_SECRET || "aganstaysecretkey";

const getApiBaseUrl = (request: NextRequest) => {
  const candidates = [
    process.env.API_URL,
    process.env.NEXT_PUBLIC_API_URL,
    `${request.nextUrl.origin}/api/v1`,
  ]
    .map((value) => value?.replace(/\/$/, ""))
    .filter(Boolean);

  return candidates[0] || `${request.nextUrl.origin}/api/v1`;
};

const refreshAdminSession = async (
  request: NextRequest,
  refreshToken: string,
) => {
  try {
    const response = await fetch(`${getApiBaseUrl(request)}/users/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-frontend-secret": FRONTEND_SECRET,
      },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      accessToken?: string;
      refreshToken?: string;
    };

    if (!data.accessToken || !data.refreshToken) {
      return null;
    }

    const session = await verifyAuthToken(data.accessToken, process.env.MY_APP_SECRET);
    if (!session || session.role !== "admin") {
      return null;
    }

    return data;
  } catch {
    return null;
  }
};

const applyAuthCookies = (
  response: NextResponse,
  tokens: { accessToken: string; refreshToken: string },
) => {
  response.cookies.set("admin_token", tokens.accessToken, {
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  response.cookies.set("refresh_token", tokens.refreshToken, {
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });

  return response;
};

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;
  const { pathname } = request.nextUrl;
  const reauthRequested = request.nextUrl.searchParams.get("reauth") === "1";
  let session = await verifyAuthToken(token, process.env.MY_APP_SECRET);

  if ((!session || session.role !== "admin") && refreshToken) {
    const refreshed = await refreshAdminSession(request, refreshToken);

    if (refreshed?.accessToken && refreshed.refreshToken) {
      const refreshedTokens = {
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken,
      };
      session = await verifyAuthToken(
        refreshedTokens.accessToken,
        process.env.MY_APP_SECRET,
      );
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set(
        "cookie",
        request.cookies
          .getAll()
          .filter((cookie) =>
            cookie.name !== "admin_token" && cookie.name !== "refresh_token",
          )
          .map((cookie) => `${cookie.name}=${cookie.value}`)
          .concat([
            `admin_token=${refreshedTokens.accessToken}`,
            `refresh_token=${refreshedTokens.refreshToken}`,
          ])
          .join("; "),
      );

      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
      applyAuthCookies(response, refreshedTokens);

      const isAdmin = session?.role === "admin";

      if (pathname === "/login") {
        if (reauthRequested) {
          return response;
        }

        if (isAdmin) {
          return applyAuthCookies(
            NextResponse.redirect(new URL("/dashboard", request.url)),
            refreshedTokens,
          );
        }

        return response;
      }

      if (isProtectedRoute(pathname) && !isAdmin) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return applyAuthCookies(NextResponse.redirect(loginUrl), refreshedTokens);
      }

      return response;
    }
  }

  const isAdmin = session?.role === "admin";

  if (pathname === "/login") {
    if (reauthRequested) {
      return NextResponse.next();
    }

    if (isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  if (isProtectedRoute(pathname) && !isAdmin) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
