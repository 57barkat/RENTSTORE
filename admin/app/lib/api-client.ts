import axios from "axios";
import { parseCookies, setCookie, destroyCookie } from "nookies";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

apiClient.interceptors.request.use((config) => {
  const cookies = parseCookies();
  const token = cookies["admin_token"];
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const cookies = parseCookies();
      const refreshToken = cookies["refresh_token"];

      if (refreshToken) {
        try {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/users/refresh`,
            {
              refreshToken: refreshToken,
            },
          );

          const newToken = res.data.accessToken;
          setCookie(null, "admin_token", newToken, { path: "/" });

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          destroyCookie(null, "admin_token");
          destroyCookie(null, "refresh_token");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
