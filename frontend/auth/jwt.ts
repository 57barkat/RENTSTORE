export function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Padded = base64 + pad;

  if (typeof atob === "function") {
    return atob(base64Padded);
  }

  // React Native / Node fallback
  // @ts-ignore
  return Buffer.from(base64Padded, "base64").toString("utf8");
}

export function jwtDecode<T = any>(token: string): T {
  const [, payload] = token.split(".");
  if (!payload) throw new Error("Invalid token");
  return JSON.parse(base64UrlDecode(payload));
}

export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const { exp } = jwtDecode<{ exp: number }>(token);
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}
