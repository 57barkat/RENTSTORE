import {
  buildLegacyListingRedirectPath,
  getPublicCategoryFromPath as getSharedPublicCategoryFromPath,
  PUBLIC_PROPERTY_ROUTE_MAP,
  parseSeoListingSlug,
} from "@/app/lib/property-seo";

export const PUBLIC_CATEGORY_ROUTE_MAP = PUBLIC_PROPERTY_ROUTE_MAP;

export const PUBLIC_CATEGORY_LINKS = [
  { href: PUBLIC_CATEGORY_ROUTE_MAP.hostel.legacyHref, label: PUBLIC_CATEGORY_ROUTE_MAP.hostel.label, category: PUBLIC_CATEGORY_ROUTE_MAP.hostel.category },
  { href: PUBLIC_CATEGORY_ROUTE_MAP.apartment.legacyHref, label: PUBLIC_CATEGORY_ROUTE_MAP.apartment.label, category: PUBLIC_CATEGORY_ROUTE_MAP.apartment.category },
  { href: PUBLIC_CATEGORY_ROUTE_MAP.house.legacyHref, label: PUBLIC_CATEGORY_ROUTE_MAP.house.label, category: PUBLIC_CATEGORY_ROUTE_MAP.house.category },
  { href: PUBLIC_CATEGORY_ROUTE_MAP.shop.legacyHref, label: PUBLIC_CATEGORY_ROUTE_MAP.shop.label, category: PUBLIC_CATEGORY_ROUTE_MAP.shop.category },
  { href: PUBLIC_CATEGORY_ROUTE_MAP.office.legacyHref, label: PUBLIC_CATEGORY_ROUTE_MAP.office.label, category: PUBLIC_CATEGORY_ROUTE_MAP.office.category },
] as const;

export const PUBLIC_CATEGORY_SEGMENTS = [
  "houses",
  "apartments",
  "hostels",
  "shops",
  "offices",
  "home",
  "house",
  "apartment",
  "hostel",
  "shop",
  "office",
] as const;

export const PROTECTED_ROUTE_PREFIXES = [
  "/dashboard",
  "/observability",
  "/properties",
  "/reports",
  "/users",
] as const;

export const STATIC_PUBLIC_ROUTES = ["/", "/login"] as const;

export const PUBLIC_AUTH_ROUTES = ["/account/login", "/account/signup"] as const;

export const PUBLIC_ACCOUNT_ROUTE_PREFIXES = [
  "/account",
  "/upload-property",
] as const;

export const isPublicCategoryPath = (pathname: string): boolean => {
  if (parseSeoListingSlug(pathname.replace(/^\//, ""))) {
    return true;
  }

  return PUBLIC_CATEGORY_SEGMENTS.some(
    (segment) =>
      pathname === `/${segment}` || pathname.startsWith(`/${segment}/`),
  );
};

export const getPublicCategoryFromPath = (
  pathname: string,
): (typeof PUBLIC_CATEGORY_LINKS)[number]["category"] | null => {
  return getSharedPublicCategoryFromPath(pathname);
};

export const getLegacyListingRedirectPath = (
  category: (typeof PUBLIC_CATEGORY_LINKS)[number]["category"],
): string | null => {
  return buildLegacyListingRedirectPath({ category });
};

export const isStaticPublicRoute = (pathname: string): boolean => {
  return STATIC_PUBLIC_ROUTES.includes(
    pathname as (typeof STATIC_PUBLIC_ROUTES)[number],
  );
};

export const isProtectedRoute = (pathname: string): boolean => {
  return PROTECTED_ROUTE_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
};

export const isPublicAuthRoute = (pathname: string): boolean => {
  return PUBLIC_AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
};

export const isPublicAccountRoute = (pathname: string): boolean => {
  return PUBLIC_ACCOUNT_ROUTE_PREFIXES.some((route) => {
    if (route === "/account") {
      return pathname.startsWith("/account/") && !isPublicAuthRoute(pathname);
    }

    return pathname === route || pathname.startsWith(`${route}/`);
  });
};
