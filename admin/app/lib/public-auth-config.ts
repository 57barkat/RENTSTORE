export const PUBLIC_ACCESS_COOKIE = "public_token";
export const PUBLIC_REFRESH_COOKIE = "public_refresh_token";

export const PUBLIC_AUTH_ROLES = ["user", "agent", "agency", "renter"] as const;

export const isAllowedPublicRole = (role: string | null | undefined) =>
  !!role && role !== "admin";
