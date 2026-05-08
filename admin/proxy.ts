import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from "@/app/lib/auth-cookies";
import { verifyAuthToken } from "@/app/lib/auth-token";
import { parsePropertyDetailSlug } from "@/app/lib/property-seo";
import {
  isProtectedRoute,
  isPublicAccountRoute,
  isPublicAuthRoute,
} from "@/app/lib/route-constants";
import {
  isAllowedPublicRole,
  PUBLIC_ACCESS_COOKIE,
  PUBLIC_REFRESH_COOKIE,
} from "@/app/lib/public-auth-config";

const FRONTEND_SECRET = process.env.MY_APP_SECRET || "";

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
      headers: FRONTEND_SECRET
        ? {
            "Content-Type": "application/json",
            "x-frontend-secret": FRONTEND_SECRET,
          }
        : {
            "Content-Type": "application/json",
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

    const session = await verifyAuthToken(
      data.accessToken,
      process.env.JWT_SECRET,
    );
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
  response.cookies.set(
    "admin_token",
    tokens.accessToken,
    getAccessTokenCookieOptions(),
  );
  response.cookies.set(
    "refresh_token",
    tokens.refreshToken,
    getRefreshTokenCookieOptions(),
  );

  return response;
};

const applyPublicAuthCookies = (
  response: NextResponse,
  tokens: { accessToken: string; refreshToken: string },
) => {
  response.cookies.set(
    PUBLIC_ACCESS_COOKIE,
    tokens.accessToken,
    getAccessTokenCookieOptions(),
  );
  response.cookies.set(
    PUBLIC_REFRESH_COOKIE,
    tokens.refreshToken,
    getRefreshTokenCookieOptions(),
  );

  return response;
};

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;
  const publicToken = request.cookies.get(PUBLIC_ACCESS_COOKIE)?.value;
  const publicRefreshToken = request.cookies.get(PUBLIC_REFRESH_COOKIE)?.value;
  const { pathname } = request.nextUrl;
  const reauthRequested = request.nextUrl.searchParams.get("reauth") === "1";
  let session = await verifyAuthToken(
    token,
    process.env.JWT_SECRET,
  );
  let publicSession = await verifyAuthToken(
    publicToken,
    process.env.JWT_SECRET,
  );

  if ((!session || session.role !== "admin") && refreshToken) {
    const refreshed = await refreshAdminSession(request, refreshToken);

    if (refreshed?.accessToken && refreshed.refreshToken) {
      const refreshedTokens = {
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken,
      };
      session = await verifyAuthToken(
        refreshedTokens.accessToken,
        process.env.JWT_SECRET,
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

  if ((!publicSession || !isAllowedPublicRole(publicSession.role)) && publicRefreshToken) {
    const refreshed = await refreshAdminSession(request, publicRefreshToken);

    if (refreshed?.accessToken && refreshed.refreshToken) {
      const refreshedTokens = {
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken,
      };
      publicSession = await verifyAuthToken(
        refreshedTokens.accessToken,
        process.env.JWT_SECRET,
      );

      if (publicSession && isAllowedPublicRole(publicSession.role)) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set(
          "cookie",
          request.cookies
            .getAll()
            .filter((cookie) =>
              cookie.name !== PUBLIC_ACCESS_COOKIE &&
              cookie.name !== PUBLIC_REFRESH_COOKIE,
            )
            .map((cookie) => `${cookie.name}=${cookie.value}`)
            .concat([
              `${PUBLIC_ACCESS_COOKIE}=${refreshedTokens.accessToken}`,
              `${PUBLIC_REFRESH_COOKIE}=${refreshedTokens.refreshToken}`,
            ])
            .join("; "),
        );

        const response = NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
        applyPublicAuthCookies(response, refreshedTokens);

        if (isPublicAuthRoute(pathname)) {
          return applyPublicAuthCookies(
            NextResponse.redirect(new URL("/account/dashboard", request.url)),
            refreshedTokens,
          );
        }

        if (isPublicAccountRoute(pathname) && !isAllowedPublicRole(publicSession.role)) {
          const loginUrl = new URL("/account/login", request.url);
          loginUrl.searchParams.set("redirect", pathname);
          return applyPublicAuthCookies(NextResponse.redirect(loginUrl), refreshedTokens);
        }

        return response;
      }
    }
  }

  if (pathname === "/login") {
    if (reauthRequested) {
      return NextResponse.next();
    }

    if (isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  if (isPublicAuthRoute(pathname)) {
    if (publicSession && isAllowedPublicRole(publicSession.role)) {
      return NextResponse.redirect(new URL("/account/dashboard", request.url));
    }

    return NextResponse.next();
  }

  if (
    isPublicAccountRoute(pathname) &&
    (!publicSession || !isAllowedPublicRole(publicSession.role))
  ) {
    const loginUrl = new URL("/account/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isProtectedRoute(pathname) && !isAdmin) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const pathSegments = pathname.split("/").filter(Boolean);
  if (
    pathSegments.length === 1 &&
    parsePropertyDetailSlug(pathSegments[0]) &&
    pathSegments[0] !== "property"
  ) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/property/${pathSegments[0]}`;
    return NextResponse.rewrite(rewriteUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
