import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.apiUrl;

/**
 * Minimal JWT payload decoder (no external dependency).
 * Supports URL-safe base64 and works with environments that provide atob or Buffer.
 */
function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Padded = base64 + pad;

  // Try atob (browser / some RN environments with global atob)
  if (typeof atob === "function") {
    try {
      const binary = atob(base64Padded);
      try {
        // decode percent-encoded UTF-8
        return decodeURIComponent(
          Array.prototype.map
            .call(binary, (c: string) => {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
        );
      } catch {
        // If decodeURIComponent fails, return binary directly
        return binary;
      }
    } catch {}
  }

  // Try Buffer (Node or RN with buffer polyfill)
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (typeof Buffer !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return Buffer.from(base64Padded, "base64").toString("utf8");
    }
  } catch {}

  throw new Error("No base64 decoder available to decode JWT payload.");
}

function jwtDecode<T = any>(token: string): T {
  const parts = token.split(".");
  if (parts.length < 2) throw new Error("Invalid JWT token");
  const payload = base64UrlDecode(parts[1]);
  return JSON.parse(payload) as T;
}

// In-memory token cache
let accessTokenCache: string | null = null;
let refreshTokenCache: string | null = null;

// Initialize cache from AsyncStorage once at app start
const initTokenCache = async () => {
  if (accessTokenCache === null) {
    accessTokenCache = await AsyncStorage.getItem("accessToken");
  }
  if (refreshTokenCache === null) {
    refreshTokenCache = await AsyncStorage.getItem("refreshToken");
  }
};

// Helper to check if token is expired
const isTokenExpired = (token: string | null) => {
  if (!token) return true;
  try {
    const { exp } = jwtDecode<{ exp: number }>(token);
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
};

// Base query with dynamic headers
const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: async (headers) => {
    // Ensure cache is initialized
    await initTokenCache();

    if (accessTokenCache) {
      headers.set("Authorization", `Bearer ${accessTokenCache}`);
    }

    return headers;
  },
});

const customBaseQuery = async (args: any, api: any, extraOptions: any) => {
  const baseQueryWithLatestToken = async () => baseQuery(args, api, extraOptions);

  let result = await baseQueryWithLatestToken();

  // Only refresh if 401 AND token actually expired
  if (result.error?.status === 401) {
    // Check if current token is expired
    if (isTokenExpired(accessTokenCache)) {
      const refreshToken = refreshTokenCache;

      if (!refreshToken) {
        api.dispatch({ type: "auth/logout" });
        return result;
      }

      // Call refresh endpoint
      const refreshResult = await baseQuery(
        {
          url: "/api/v1/users/refresh",
          method: "POST",
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const { accessToken, refreshToken: newRefreshToken } = refreshResult.data as any;

        // Save to AsyncStorage and in-memory cache
        accessTokenCache = accessToken;
        refreshTokenCache = newRefreshToken;

        await AsyncStorage.setItem("accessToken", accessToken);
        await AsyncStorage.setItem("refreshToken", newRefreshToken);

        // Retry original request with new token
        result = await baseQueryWithLatestToken();
      } else {
        api.dispatch({ type: "auth/logout" });
      }
    }
  }

  return result;
};

// Create API
export const api = createApi({
  reducerPath: "api",
  baseQuery: customBaseQuery,
  endpoints: (builder) => ({
    // 🔹 USER AUTH
    createUser: builder.mutation({
      query: (body) => ({ url: "/api/v1/users/signup", method: "POST", body }),
    }),
    login: builder.mutation({
      query: (body) => ({ url: "/api/v1/users/login", method: "POST", body }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          accessTokenCache = data.accessToken;
          refreshTokenCache = data.refreshToken;
          await AsyncStorage.setItem("accessToken", data.accessToken);
          await AsyncStorage.setItem("refreshToken", data.refreshToken);
        } catch {}
      },
    }),
    deleteUser: builder.mutation({
      query: () => ({ url: "/api/v1/users/delete", method: "DELETE" }),
    }),

    // 🔹 PROPERTY MUTATIONS
    createProperty: builder.mutation({
      query: (body) => {
        const formData = new FormData();

        Object.entries(body).forEach(([key, value]) => {
          if (key === "photos") return;

          if (value !== undefined && value !== null) {
            if (typeof value === "object") {
              formData.append(key, JSON.stringify(value ?? []));
            } else {
              formData.append(key, String(value));
            }
          }
        });

        if (Array.isArray(body.photos)) {
          body.photos.forEach((uri: string, idx: number) => {
            formData.append("photos", {
              uri,
              name: `photo_${idx}.jpeg`,
              type: "image/jpeg",
            } as any);
          });
        }

        return {
          url: "/api/v1/properties/create",
          method: "POST",
          body: formData,
        };
      },
    }),
    findPropertyByIdAndUpdate: builder.mutation({
      query: ({ id, data }) => ({
        url: `/api/v1/properties/${id}`,
        method: "PATCH",
        body: data,
      }),
    }),
    findPropertyByIdAndDelete: builder.mutation({
      query: (id) => ({ url: `/api/v1/properties/${id}`, method: "DELETE" }),
    }),

    // 🔹 PROPERTY QUERIES
    findMyProperties: builder.query({
      query: () => ({ url: "/api/v1/properties/my-listings", method: "GET" }),
    }),
    findPropertyById: builder.query({
      query: (id) => ({ url: `/api/v1/properties/${id}`, method: "GET" }),
    }),
    getAllProperties: builder.query({
      query: (params = "") => ({ url: `/api/v1/properties${params}`, method: "GET" }),
    }),
    getFilterOptions: builder.query({
      query: () => ({ url: "/api/v1/properties/filters", method: "GET" }),
    }),
    getFilteredProperties: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams();
        Object.entries(params || {}).forEach(([key, value]) => {
          if (value !== undefined && value !== null)
            queryParams.append(key, String(value));
        });
        return {
          url: `/api/v1/properties/search?${queryParams.toString()}`,
          method: "GET",
        };
      },
    }),
    getFeaturedProperties: builder.query({
      query: () => ({ url: "/api/v1/properties/featured", method: "GET" }),
    }),
    getDraftProperties: builder.query({
      query: () => ({ url: "/api/v1/properties/drafts", method: "GET" }),
    }),

    // 🔹 FAVORITES
    getUserFavorites: builder.query({ query: () => "/api/v1/favorites" }),
    AddToFav: builder.mutation({
      query: ({ propertyId }) => ({ url: `/api/v1/favorites/${propertyId}`, method: "POST" }),
    }),
    removeUserFavorite: builder.mutation({
      query: ({ propertyId }) => ({ url: `/api/v1/favorites/${propertyId}`, method: "DELETE" }),
    }),

    // 🔹 OTP LOGIN
    sendOtp: builder.mutation({
      query: ({ phone }) => ({ url: "/api/v1/auth/send-otp", method: "POST", body: { phone } }),
    }),
    verifyOtp: builder.mutation({
      query: ({ phone, otp }) => ({ url: "/api/v1/auth/verify-otp", method: "POST", body: { phone, otp } }),
    }),

    // 🔹 GOOGLE LOGIN
    loginWithGoogle: builder.mutation({
      query: (body) => ({ url: "/api/v1/users/google", method: "POST", body }),
    }),
  }),
});

// Export hooks
export const {
  useCreateUserMutation,
  useLoginMutation,
  useDeleteUserMutation,
  useCreatePropertyMutation,
  useFindMyPropertiesQuery,
  useFindPropertyByIdQuery,
  useFindPropertyByIdAndUpdateMutation,
  useFindPropertyByIdAndDeleteMutation,
  useGetAllPropertiesQuery,
  useGetFilteredPropertiesQuery,
  useGetFilterOptionsQuery,
  useGetFeaturedPropertiesQuery,
  useAddToFavMutation,
  useGetUserFavoritesQuery,
  useRemoveUserFavoriteMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useGetDraftPropertiesQuery,
  useLoginWithGoogleMutation,
} = api;
