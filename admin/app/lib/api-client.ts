import axios from "axios";
import type { AxiosHeaders, InternalAxiosRequestConfig } from "axios";
import { destroyCookie, parseCookies, setCookie } from "nookies";

const API_BASE_URL = (
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://banefully-jointed-freya.ngrok-free.dev/api/v1"
).replace(/\/$/, "");

const FRONTEND_SECRET = process.env.MY_APP_SECRET || "aganstaysecretkey";

const assertServerBaseUrl = () => {
  if (!API_BASE_URL && typeof window === "undefined") {
    throw new Error(
      "Missing API_URL or NEXT_PUBLIC_API_URL for server-side requests.",
    );
  }
};

const apiClient = axios.create({
  baseURL: API_BASE_URL || undefined,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  assertServerBaseUrl();

  const cookies = parseCookies();
  const token = cookies["admin_token"];

  config.baseURL = config.baseURL || API_BASE_URL || undefined;

  const headers = config.headers as AxiosHeaders & Record<string, string>;

  // ✅ Always send frontend secret (for SSR / public validation)
  headers["x-frontend-secret"] = FRONTEND_SECRET;

  // ✅ Send JWT if available
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

      const cookies = parseCookies();
      const refreshToken = cookies["refresh_token"];

      if (refreshToken && API_BASE_URL) {
        try {
          const res = await axios.post(`${API_BASE_URL}/users/refresh`, {
            refreshToken,
          });

          const newToken = res.data.accessToken;

          setCookie(null, "admin_token", newToken, { path: "/" });

          originalRequest.headers = originalRequest.headers || {};
          (
            originalRequest.headers as AxiosHeaders & Record<string, string>
          ).Authorization = `Bearer ${newToken}`;

          return apiClient(originalRequest);
        } catch (refreshError) {
          destroyCookie(null, "admin_token");
          destroyCookie(null, "refresh_token");

          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
