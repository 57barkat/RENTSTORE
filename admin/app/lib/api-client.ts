import axios from "axios";
import type { AxiosHeaders, InternalAxiosRequestConfig } from "axios";
import { destroyCookie, parseCookies, setCookie } from "nookies";

const API_BASE_PATH = "/api/v1";
const FRONTEND_SECRET = process.env.MY_APP_SECRET || "aganstaysecretkey";

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

      const cookies = parseCookies();
      const refreshToken = cookies["refresh_token"];

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_PATH}/users/refresh`, {
            refreshToken,
          });

          const newToken = res.data.accessToken;

          setCookie(null, "admin_token", newToken, { path: "/" });

          originalRequest.headers = originalRequest.headers || {};
          (
            originalRequest.headers as AxiosHeaders & Record<string, string>
          ).Authorization = `Bearer ${newToken}`;

          return apiClient(originalRequest);
        } catch {
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
