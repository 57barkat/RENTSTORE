import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { isTokenExpired } from "../auth/jwt";
import { tokenManager } from "./tokenManager";

export const API_URL = "http://localhost:3000";

// export const API_URL =
//   process.env.EXPO_PUBLIC_API_URL ||
//   "http://172.16.18.99:3000" ||
//   "http://10.98.91.143:3000";
const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: async (headers) => {
    // Ensure tokens are loaded from storage
    await tokenManager.load();
    const token = tokenManager.getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

let refreshPromise: Promise<void> | null = null;

const refreshTokens = async (api: any, extraOptions: any) => {
  const refreshToken = tokenManager.getRefreshToken();
  if (!refreshToken) {
    await tokenManager.clear();
    return;
  }

  const result = await rawBaseQuery(
    {
      url: "/api/v1/users/refresh",
      method: "POST",
      body: { refreshToken },
    },
    api,
    extraOptions,
  );

  if (result.data) {
    const { accessToken, refreshToken: newRefresh } = result.data as any;
    await tokenManager.setTokens(accessToken, newRefresh);
  } else {
    await tokenManager.clear();
  }
};

const baseQueryWithRefresh = async (args: any, api: any, extraOptions: any) => {
  await tokenManager.load();
  const accessToken = tokenManager.getAccessToken();

  if (accessToken && isTokenExpired(accessToken)) {
    if (!refreshPromise) {
      refreshPromise = refreshTokens(api, extraOptions).finally(() => {
        refreshPromise = null;
      });
    }
    await refreshPromise;
  }

  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status === 401) {
    await tokenManager.clear();
  }
  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithRefresh,
  tagTypes: ["Property", "Favorites", "User"],
  endpoints: (builder) => ({
    createUser: builder.mutation({
      query: (body) => ({ url: "/api/v1/users/signup", method: "POST", body }),
    }),
    login: builder.mutation({
      query: (body) => ({ url: "/api/v1/users/login", method: "POST", body }),
    }),
    deleteUser: builder.mutation({
      query: () => ({ url: "/api/v1/users/delete", method: "DELETE" }),
    }),
    createProperty: builder.mutation({
      query: (body) => {
        const formData = new FormData();
        Object.entries(body).forEach(([key, value]) => {
          if (key === "photos") return;
          if (value !== undefined && value !== null) {
            if (typeof value === "object") {
              formData.append(key, JSON.stringify(value));
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
      query: (id) => ({
        url: `/api/v1/properties/${id}`,
        method: "DELETE",
      }),
    }),
    findDraftPropertyByIdAndDelete: builder.mutation({
      query: (id) => ({
        url: `/api/v1/properties/drafts/${id}`,
        method: "DELETE",
      }),
    }),
    findMyProperties: builder.query({
      query: () => ({ url: "/api/v1/properties/my-listings", method: "GET" }),
    }),
    findPropertyById: builder.query({
      query: (id) => ({ url: `/api/v1/properties/${id}`, method: "GET" }),
    }),
    getAllProperties: builder.query({
      query: (
        params: { page?: number; limit?: number; hostOption?: string } = {},
      ) => {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && key !== "hostOption") {
            query.append(key, String(value));
          }
        });
        const url = params.hostOption
          ? `/api/v1/properties/type/${params.hostOption}?${query.toString()}`
          : `/api/v1/properties?${query.toString()}`;
        return { url, method: "GET" };
      },
    }),
    getFilterOptions: builder.query({
      query: () => ({ url: "/api/v1/properties/filters", method: "GET" }),
    }),
    getFilteredProperties: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value === undefined || value === null) return;
            queryParams.append(
              key,
              Array.isArray(value) ? value.join(",") : String(value),
            );
          });
        }
        return {
          url: `/api/v1/properties/search?${queryParams.toString()}`,
          method: "GET",
        };
      },
    }),
    getFeaturedProperties: builder.query({
      query: () => ({ url: "/api/v1/properties/featured", method: "GET" }),
    }),
    getDraftProperties: builder.query<any[], void>({
      query: () => ({ url: "/api/v1/properties/drafts", method: "GET" }),
    }),

    getUserFavorites: builder.query({ query: () => "/api/v1/favorites" }),
    AddToFav: builder.mutation({
      query: ({ propertyId }) => ({
        url: `/api/v1/favorites/${propertyId}`,
        method: "POST",
      }),
    }),
    removeUserFavorite: builder.mutation({
      query: ({ propertyId }) => ({
        url: `/api/v1/favorites/${propertyId}`,
        method: "DELETE",
      }),
    }),
    sendOtp: builder.mutation({
      query: ({ phone }) => ({
        url: "/api/v1/auth/send-otp",
        method: "POST",
        body: { phone },
      }),
    }),
    verifyOtp: builder.mutation({
      query: ({ phone, otp }) => ({
        url: "/api/v1/auth/verify-otp",
        method: "POST",
        body: { phone, otp },
      }),
    }),
    loginWithGoogle: builder.mutation({
      query: (body) => ({ url: "/api/v1/users/google", method: "POST", body }),
    }),
    getUserStats: builder.query({
      query: () => ({ url: "/api/v1/user/stats", method: "GET" }),
    }),
    uploadProfileImage: builder.mutation({
      query: (formData: FormData | null) => ({
        url: "/api/v1/user/profile-image",
        method: "POST",
        body: formData,
      }),
    }),
    deleteProfileImage: builder.mutation<void, void>({
      query: () => ({ url: "/api/v1/user/profile-image", method: "DELETE" }),
    }),
    voiceSearch: builder.mutation<any, { uri: string }>({
      query: ({ uri }) => {
        const formData = new FormData();
        formData.append("audio", {
          uri,
          name: "voice-search.m4a",
          type: "audio/m4a",
        } as any);
        return { url: "/api/v1/search/voice", method: "POST", body: formData };
      },
    }),
    verifyEmail: builder.mutation({
      query: (body) => ({
        url: "/api/v1/users/verify-email",
        method: "POST",
        body,
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/api/v1/users/logout",
        method: "POST",
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
          dispatch(api.util.resetApiState());
        } catch (err) {
          console.error("Logout mutation failed", err);
        }
      },
    }),
    clearVoiceSession: builder.mutation<void, void>({
      query: () => ({
        url: "/api/v1/search/voice/cancel",
        method: "POST",
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
        } catch (err) {
          console.error("Failed to clear voice session", err);
        }
      },
    }),
  }),
});

export const {
  useCreateUserMutation,
  useLoginMutation,
  useDeleteUserMutation,
  useCreatePropertyMutation,
  useFindMyPropertiesQuery,
  useFindPropertyByIdQuery,
  useFindPropertyByIdAndUpdateMutation,
  useFindPropertyByIdAndDeleteMutation,
  useFindDraftPropertyByIdAndDeleteMutation,
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
  useGetUserStatsQuery,
  useUploadProfileImageMutation,
  useDeleteProfileImageMutation,
  useVoiceSearchMutation,
  useVerifyEmailMutation,
  useLogoutMutation,
  useClearVoiceSessionMutation,
} = api;
