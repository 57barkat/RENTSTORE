import axios from "axios";
import type { AxiosHeaders, InternalAxiosRequestConfig } from "axios";
import { destroyCookie, parseCookies } from "nookies";

import { getAccessTokenCookieOptions } from "@/app/lib/auth-cookies";
import { PUBLIC_ACCESS_COOKIE } from "@/app/lib/public-auth-config";
import { broadcastAuthSessionEvent } from "@/app/lib/session-sync";

const API_BASE_PATH = "/api/v1";
const FRONTEND_SECRET = process.env.MY_APP_SECRET || "";
let refreshRequest: Promise<{ accessToken: string }> | null = null;

export class PublicAuthSessionExpiredError extends Error {
  constructor(message = "Public auth session expired") {
    super(message);
    this.name = "PublicAuthSessionExpiredError";
  }
}

export const isPublicAuthSessionExpiredError = (
  error: unknown,
): error is PublicAuthSessionExpiredError =>
  error instanceof PublicAuthSessionExpiredError;

const publicApiClient = axios.create({
  baseURL: API_BASE_PATH,
});

const persistPublicAccessToken = (accessToken: string) => {
  if (typeof document === "undefined") {
    return;
  }

  const options = getAccessTokenCookieOptions();
  document.cookie = `${PUBLIC_ACCESS_COOKIE}=${accessToken}; Path=/; Max-Age=${options.maxAge}; SameSite=Lax${
    options.secure ? "; Secure" : ""
  }`;
};

export const refreshPublicAccessToken = async () => {
  if (!refreshRequest) {
    refreshRequest = fetch("/api/public-auth/refresh", {
      method: "POST",
      credentials: "same-origin",
    })
      .then(async (res) => {
        const payload = await res.json().catch(() => null);
        if (!res.ok || !payload?.accessToken) {
          throw new PublicAuthSessionExpiredError("Refresh failed");
        }
        return { accessToken: payload.accessToken as string };
      })
      .finally(() => {
        refreshRequest = null;
      });
  }

  const refreshed = await refreshRequest;
  persistPublicAccessToken(refreshed.accessToken);
  broadcastAuthSessionEvent("public", "refresh");
  return refreshed.accessToken;
};

const clearPublicBrowserSession = async (reason: string) => {
  destroyCookie(null, PUBLIC_ACCESS_COOKIE, { path: "/" });

  if (typeof window === "undefined") {
    return;
  }

  await fetch("/api/public-auth/logout", {
    method: "POST",
    credentials: "same-origin",
  }).catch(() => null);

  broadcastAuthSessionEvent("public", "logout", reason);
};

const redirectToPublicLoginIfNeeded = () => {
  if (typeof window === "undefined") {
    return;
  }

  const { pathname } = window.location;
  const isPublicAuthPage =
    pathname === "/account/login" || pathname === "/account/signup";
  const requiresAuthenticatedPage =
    !isPublicAuthPage &&
    (pathname.startsWith("/account/") ||
      pathname === "/upload-property" ||
      pathname.startsWith("/upload-property/"));

  if (!requiresAuthenticatedPage) {
    return;
  }

  const redirectPath = encodeURIComponent(
    `${window.location.pathname}${window.location.search}`,
  );
  window.location.href = `/account/login?redirect=${redirectPath}`;
};

publicApiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const cookies = parseCookies();
  const token = cookies[PUBLIC_ACCESS_COOKIE];

  config.baseURL = config.baseURL || API_BASE_PATH;

  const headers = config.headers as AxiosHeaders & Record<string, string>;
  if (FRONTEND_SECRET) {
    headers["x-frontend-secret"] = FRONTEND_SECRET;
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

publicApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshPublicAccessToken();

        originalRequest.headers = originalRequest.headers || {};
        (
          originalRequest.headers as AxiosHeaders & Record<string, string>
        ).Authorization = `Bearer ${newToken}`;

        return publicApiClient(originalRequest);
      } catch {
        await clearPublicBrowserSession("refresh-failed");
        redirectToPublicLoginIfNeeded();
        return Promise.reject(new PublicAuthSessionExpiredError());
      }
    }

    return Promise.reject(error);
  },
);

export default publicApiClient;
