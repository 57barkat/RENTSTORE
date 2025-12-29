import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Constants from "expo-constants";
import { tokenManager } from "../auth/tokenManager";
import { isTokenExpired } from "../auth/jwt";

const API_URL = Constants.expoConfig?.extra?.apiUrl ?? "";

/* ----------------------------------------------------
   BASE QUERY
---------------------------------------------------- */

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers) => {
    const token = tokenManager.getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

/* ----------------------------------------------------
   REFRESH HANDLING (SINGLE FLIGHT)
---------------------------------------------------- */

let refreshPromise: Promise<void> | null = null;

const baseQueryWithRefresh = async (args: any, api: any, extraOptions: any) => {
  await tokenManager.load();

  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const accessToken = tokenManager.getAccessToken();

    // Only refresh if token actually expired
    if (!isTokenExpired(accessToken)) {
      return result;
    }

    if (!refreshPromise) {
      refreshPromise = (async () => {
        const refreshToken = tokenManager.getRefreshToken();
        if (!refreshToken) {
          await tokenManager.clear();
          api.dispatch({ type: "auth/logout" });
          return;
        }

        const refreshResult = await rawBaseQuery(
          {
            url: "/api/v1/users/refresh",
            method: "POST",
            body: { refreshToken },
          },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          const { accessToken, refreshToken: newRefresh } =
            refreshResult.data as any;

          await tokenManager.setTokens(accessToken, newRefresh);
        } else {
          await tokenManager.clear();
          api.dispatch({ type: "auth/logout" });
        }
      })().finally(() => {
        refreshPromise = null;
      });
    }

    await refreshPromise;
    result = await rawBaseQuery(args, api, extraOptions);
  }

  return result;
};

/* ----------------------------------------------------
   API
---------------------------------------------------- */

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithRefresh,
  tagTypes: ["Property", "Favorites", "User"],
  endpoints: (builder) => ({
    /* ---------- AUTH ---------- */

    createUser: builder.mutation({
      query: (body) => ({
        url: "/api/v1/users/signup",
        method: "POST",
        body,
      }),
    }),

    login: builder.mutation({
      query: (body) => ({
        url: "/api/v1/users/login",
        method: "POST",
        body,
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        const { data } = await queryFulfilled;
        await tokenManager.setTokens(data.accessToken, data.refreshToken);
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
      query: (
        params: { page?: number; limit?: number; hostOption?: string } = {}
      ) => {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && key !== "hostOption") {
            query.append(key, String(value));
          }
        });

        if (params.hostOption) {
          return {
            url: `/api/v1/properties/type/${
              params.hostOption
            }?${query.toString()}`,
            method: "GET",
          };
        }

        return {
          url: `/api/v1/properties?${query.toString()}`,
          method: "GET",
        };
      },
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

    // 🔹 OTP LOGIN
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

    // 🔹 GOOGLE LOGIN
    loginWithGoogle: builder.mutation({
      query: (body) => ({ url: "/api/v1/users/google", method: "POST", body }),
    }),
    getUserStats: builder.query({
      query: () => ({ url: "/api/v1/user/stats", method: "GET" }),
    }),

    uploadProfileImage: builder.mutation({
      query: (formData: FormData | null) => {
        return {
          url: "/api/v1/user/profile-image",
          method: "POST",
          body: formData,
        };
      },
    }),
    deleteProfileImage: builder.mutation<void, void>({
      query: () => ({
        url: "/api/v1/user/profile-image",
        method: "DELETE",
      }),
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
  useGetUserStatsQuery,
  useUploadProfileImageMutation,
  useDeleteProfileImageMutation,
} = api;
