export const PUBLIC_CATEGORY_LINKS = [
  { href: "/hostels", label: "Hostel" },
  { href: "/apartments", label: "Apartment" },
  { href: "/houses", label: "House" },
] as const;

export const PUBLIC_CATEGORY_SEGMENTS = [
  "houses",
  "apartments",
  "hostels",
  "home",
  "house",
  "apartment",
  "hostel",
] as const;

export const PROTECTED_ROUTE_PREFIXES = [
  "/dashboard",
  "/properties",
  "/reports",
  "/users",
] as const;

export const STATIC_PUBLIC_ROUTES = ["/", "/login"] as const;

export const isPublicCategoryPath = (pathname: string): boolean => {
  return PUBLIC_CATEGORY_SEGMENTS.some(
    (segment) =>
      pathname === `/${segment}` || pathname.startsWith(`/${segment}/`),
  );
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
