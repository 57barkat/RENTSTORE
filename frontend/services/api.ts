import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const customBaseQuery = async (args: any, api: any, extraOptions: any) => {
  const token = await AsyncStorage.getItem("accessToken");
  const rawBaseQuery = fetchBaseQuery({
    baseUrl: process.env.EXPO_PUBLIC_API_URL || "http://172.16.18.99:3000",
    prepareHeaders: (headers) => {
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  });
  return rawBaseQuery(args, api, extraOptions);
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: customBaseQuery,

  endpoints: (builder) => ({
    // 🔹 USER AUTH
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
    }),
    deleteUser: builder.mutation({
      query: () => ({
        url: "/api/v1/users/delete",
        method: "DELETE",
      }),
    }),

    createProperty: builder.mutation({
      query: (body) => {
        const formData = new FormData();

        Object.entries(body).forEach(([key, value]) => {
          if (key === "photos") return;

          if (value !== undefined && value !== null) {
            if (typeof value === "object") {
              // Convert empty arrays to "[]"
              formData.append(key, JSON.stringify(value ?? []));
            } else {
              formData.append(key, String(value));
            }
          }
        });

        // Append photos
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

    // 🔹 PROPERTY QUERIES
    findMyProperties: builder.query({
      query: () => ({
        url: "/api/v1/properties/my-listings",
        method: "GET",
      }),
    }),
    findPropertyById: builder.query({
      query: (id) => ({
        url: `/api/v1/properties/${id}`,
        method: "GET",
      }),
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

    // 🔹 FILTERS & SEARCH
    getAllProperties: builder.query({
      query: (params = "") => ({
        url: `/api/v1/properties${params}`,
        method: "GET",
      }),
    }),
    getFilterOptions: builder.query({
      query: () => ({
        url: "/api/v1/properties/filters",
        method: "GET",
      }),
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
    // 🔹 FEATURED PROPERTIES
    getFeaturedProperties: builder.query({
      query: () => ({
        url: "/api/v1/properties/featured",
        method: "GET",
      }),
    }),
    getDraftProperties: builder.query({
      query: () => ({
        url: "/api/v1/properties/drafts   ",
        method: "GET",
      }),
    }),

    // 🔹 FAVORITES
    getUserFavorites: builder.query({
      query: () => "/api/v1/favorites",
    }),
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
      query: (body) => ({
        url: "/api/v1/users/google",
        method: "POST",
        body,
      }),
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
