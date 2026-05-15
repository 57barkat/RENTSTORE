import axios from "axios";
import type { AxiosHeaders, InternalAxiosRequestConfig } from "axios";
import { destroyCookie, parseCookies } from "nookies";
import { getAccessTokenCookieOptions } from "@/app/lib/auth-cookies";
import { broadcastAuthSessionEvent } from "@/app/lib/session-sync";

const API_BASE_PATH = "/api/v1";
const FRONTEND_SECRET = process.env.MY_APP_SECRET || "";
let refreshRequest: Promise<{ accessToken: string }> | null = null;

export class AdminAuthSessionExpiredError extends Error {
  constructor(message = "Admin auth session expired") {
    super(message);
    this.name = "AdminAuthSessionExpiredError";
  }
}

const apiClient = axios.create({
  baseURL: API_BASE_PATH,
});

const persistAdminAccessToken = (accessToken: string) => {
  if (typeof document === "undefined") {
    return;
  }

  const options = getAccessTokenCookieOptions();
  document.cookie = `admin_token=${accessToken}; Path=/; Max-Age=${options.maxAge}; SameSite=Lax${
    options.secure ? "; Secure" : ""
  }`;
};

export const refreshAdminAccessToken = async () => {
  if (!refreshRequest) {
    refreshRequest = fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "same-origin",
    })
      .then(async (res) => {
        const payload = await res.json().catch(() => null);
        if (!res.ok || !payload?.accessToken) {
          throw new AdminAuthSessionExpiredError("Refresh failed");
        }
        return { accessToken: payload.accessToken as string };
      })
      .finally(() => {
        refreshRequest = null;
      });
  }

  const refreshed = await refreshRequest;
  persistAdminAccessToken(refreshed.accessToken);
  broadcastAuthSessionEvent("admin", "refresh");
  return refreshed.accessToken;
};

const clearAdminBrowserSession = async (reason: string) => {
  destroyCookie(null, "admin_token", { path: "/" });

  if (typeof window === "undefined") {
    return;
  }

  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "same-origin",
  }).catch(() => null);

  broadcastAuthSessionEvent("admin", "logout", reason);
};

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const cookies = parseCookies();
  const token = cookies["admin_token"];

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
        const newToken = await refreshAdminAccessToken();

        originalRequest.headers = originalRequest.headers || {};
        (
          originalRequest.headers as AxiosHeaders & Record<string, string>
        ).Authorization = `Bearer ${newToken}`;

        return apiClient(originalRequest);
      } catch {
        if (typeof window !== "undefined") {
          await clearAdminBrowserSession("refresh-failed");
          window.location.href = "/login?reauth=1";
        }
        return Promise.reject(new AdminAuthSessionExpiredError());
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
