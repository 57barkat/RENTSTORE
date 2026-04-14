/* eslint-disable */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_STATIC_ROUTES = ["/login", "/about", "/contact", "/privacy", "/"];
const VALID_CATEGORIES = ["home", "hostel", "apartment"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  const { pathname } = request.nextUrl;

  // 1. Check if it's a static public route
  const isStaticPublic = PUBLIC_STATIC_ROUTES.includes(pathname);

  // 2. Check if it's a dynamic public route (e.g., /hostel/islamabad/...)
  // We split the path and check if the first segment is one of our categories
  const pathSegments = pathname.split("/").filter(Boolean); // removes empty strings
  const firstSegment = pathSegments[0];
  const isDynamicPublic = VALID_CATEGORIES.includes(firstSegment);

  const isPublic = isStaticPublic || isDynamicPublic;

  // Logic for Public Routes
  if (isPublic) {
    // If logged in as admin, don't let them go back to login page
    if (token && pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Logic for Protected Routes (Dashboard, Settings, etc.)
  if (!token) {
    // If trying to access admin area without token, send to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Matches all routes except static files and API routes
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
