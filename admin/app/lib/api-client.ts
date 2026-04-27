import axios from "axios";
import type { AxiosHeaders, InternalAxiosRequestConfig } from "axios";
import { destroyCookie, parseCookies } from "nookies";
import { getAccessTokenCookieOptions } from "@/app/lib/auth-cookies";

const API_BASE_PATH = "/api/v1";
const FRONTEND_SECRET = process.env.MY_APP_SECRET || "aganstaysecretkey";
let refreshRequest: Promise<{ accessToken: string }> | null = null;

const apiClient = axios.create({
  baseURL: API_BASE_PATH,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const cookies = parseCookies();
  const token = cookies["admin_token"];

  config.baseURL = config.baseURL || API_BASE_PATH;

  const headers = config.headers as AxiosHeaders & Record<string, string>;
  headers["x-frontend-secret"] = FRONTEND_SECRET;

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
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
          refreshRequest = fetch("/api/auth/refresh", {
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

        document.cookie = `admin_token=${newToken}; Path=/; Max-Age=${getAccessTokenCookieOptions().maxAge}; SameSite=Lax${
          getAccessTokenCookieOptions().secure ? "; Secure" : ""
        }`;
        originalRequest.headers = originalRequest.headers || {};
        (
          originalRequest.headers as AxiosHeaders & Record<string, string>
        ).Authorization = `Bearer ${newToken}`;

        return apiClient(originalRequest);
      } catch {
        destroyCookie(null, "admin_token", { path: "/" });

        if (typeof window !== "undefined") {
          void fetch("/api/auth/logout", {
            method: "POST",
            credentials: "same-origin",
          }).finally(() => {
            window.location.href = "/login?reauth=1";
          });
        }
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
