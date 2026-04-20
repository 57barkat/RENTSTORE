import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { verifyAuthToken } from "@/app/lib/auth-token";
import { isProtectedRoute } from "@/app/lib/route-constants";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  const { pathname } = request.nextUrl;
  const session = await verifyAuthToken(token, process.env.MY_APP_SECRET);
  const isAdmin = session?.role === "admin";

  if (pathname === "/login") {
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
