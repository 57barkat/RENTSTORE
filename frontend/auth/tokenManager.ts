/**
 * Safely decode Base64URL strings
 */
export function base64UrlDecode(input: string): string {
  try {
    const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);

    // Browser environments
    if (typeof atob === "function") {
      return atob(padded);
    }

    // React Native / Node fallback
    // @ts-ignore
    return Buffer.from(padded, "base64").toString("utf8");
  } catch {
    throw new Error("Base64URL decode failed");
  }
}

/**
 * Decode JWT payload safely
 */
export function jwtDecode<T = any>(token: string): T {
  if (!token || typeof token !== "string") {
    throw new Error("Invalid JWT token");
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Malformed JWT");
  }

  const payload = parts[1];
  if (!payload) {
    throw new Error("Missing JWT payload");
  }

  const decoded = base64UrlDecode(payload);

  try {
    return JSON.parse(decoded) as T;
  } catch {
    throw new Error("Invalid JWT payload JSON");
  }
}

/**
 * Token expiration check
 *
 * - Includes clock skew tolerance
 * - Fails closed (invalid tokens = expired)
 */
export function isTokenExpired(
  token: string | null,
  skewSeconds: number = 30, // ⏱ clock drift tolerance
): boolean {
  if (!token) return true;

  try {
    const decoded = jwtDecode<{ exp?: number }>(token);

    if (!decoded.exp || typeof decoded.exp !== "number") {
      return true;
    }

    const now = Date.now();
    const expiry = decoded.exp * 1000;

    return now >= expiry - skewSeconds * 1000;
  } catch {
    return true;
  }
}
