import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAuthToken } from "@/app/lib/auth-token";
import { isProtectedRoute } from "@/app/lib/route-constants";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  const { pathname } = request.nextUrl;
  console.log("SECRET BEING USED:", process.env.MY_APP_SECRET, token);
  // IMPORTANT: Ensure your MY_APP_SECRET is correctly loaded
  const session = await verifyAuthToken(token, process.env.MY_APP_SECRET);
  const isAdmin = session?.role === "admin";
  console.log("Middleware session:", session); // LOGGING - Check your terminal to see the session details
  // LOGGING - Check your terminal to see if this says true or false
  console.log(
    `Path: ${pathname} | Token Found: ${!!token} | IsAdmin: ${isAdmin}`,
  );

  if (pathname === "/login") {
    if (isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (isProtectedRoute(pathname)) {
    if (!isAdmin) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
