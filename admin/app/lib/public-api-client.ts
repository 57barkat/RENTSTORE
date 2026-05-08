import axios from "axios";
import type { AxiosHeaders, InternalAxiosRequestConfig } from "axios";
import { destroyCookie, parseCookies } from "nookies";

import { getAccessTokenCookieOptions } from "@/app/lib/auth-cookies";
import { PUBLIC_ACCESS_COOKIE } from "@/app/lib/public-auth-config";

const API_BASE_PATH = "/api/v1";
const FRONTEND_SECRET = process.env.MY_APP_SECRET || "";
let refreshRequest: Promise<{ accessToken: string }> | null = null;

const publicApiClient = axios.create({
  baseURL: API_BASE_PATH,
});

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
        if (!refreshRequest) {
          refreshRequest = fetch("/api/public-auth/refresh", {
            method: "POST",
            credentials: "same-origin",
          })
            .then(async (res) => {
              const payload = await res.json().catch(() => null);
              if (!res.ok || !payload?.accessToken) {
                throw new Error("Refresh failed");
              }
              return { accessToken: payload.accessToken as string };
            })
            .finally(() => {
              refreshRequest = null;
            });
        }

        const { accessToken: newToken } = await refreshRequest;

        document.cookie = `${PUBLIC_ACCESS_COOKIE}=${newToken}; Path=/; Max-Age=${getAccessTokenCookieOptions().maxAge}; SameSite=Lax${
          getAccessTokenCookieOptions().secure ? "; Secure" : ""
        }`;
        originalRequest.headers = originalRequest.headers || {};
        (
          originalRequest.headers as AxiosHeaders & Record<string, string>
        ).Authorization = `Bearer ${newToken}`;

        return publicApiClient(originalRequest);
      } catch {
        destroyCookie(null, PUBLIC_ACCESS_COOKIE, { path: "/" });

        if (typeof window !== "undefined") {
          const requiresAuthenticatedPage =
            window.location.pathname.startsWith("/account") ||
            window.location.pathname.startsWith("/upload-property");

          void fetch("/api/public-auth/logout", {
            method: "POST",
            credentials: "same-origin",
          }).finally(() => {
            if (requiresAuthenticatedPage) {
              const redirectPath = encodeURIComponent(
                `${window.location.pathname}${window.location.search}`,
              );
              window.location.href = `/account/login?redirect=${redirectPath}`;
            }
          });
        }
      }
    }

    return Promise.reject(error);
  },
);

export default publicApiClient;
