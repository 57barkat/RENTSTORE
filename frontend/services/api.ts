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
    createUser: builder.mutation<any, any>({
      query: (body) => ({
        url: "/api/v1/users/signup",
        method: "POST",
        body,
      }),
    }),
    login: builder.mutation<any, { emailOrPhone: string; password: string }>({
      query: (body) => ({
        url: "/api/v1/users/login",
        method: "POST",
        body,
      }),
    }),

    deleteUser: builder.mutation<any, void>({
      query: () => ({
        url: `/api/v1/users/delete`,
        method: "DELETE",
      }),
    }),

    createProperty: builder.mutation<any, any>({
      query: (body) => {
        const formData = new FormData();

        Object.entries(body).forEach(([key, value]) => {
          if (key === "photos" || key === "videos" || key === "images") return; // exclude media keys here
          if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });

        if (body.images && Array.isArray(body.images)) {
          body.images.forEach((img: any, idx: number) => {
            if (img?.uri) {
              formData.append("images", {
                uri: img.uri,
                name: img.fileName || img.name || `photo_${idx}.jpg`,
                type: img.mimeType || img.type || "image/jpeg",
              } as any);
            }
          });
        }

        if (body.videos && Array.isArray(body.videos)) {
          body.videos.forEach((video: any, idx: number) => {
            if (video?.uri) {
              formData.append("videos", {
                uri: video.uri,
                name: video.fileName || video.name || `video_${idx}.mp4`,
                type: video.mimeType || video.type || "video/mp4",
              } as any);
            }
          });
        }

        // Debug log for FormData keys
        if (__DEV__) {
          // @ts-ignore
          for (let pair of formData._parts || []) {
            // console.log("FormData:", pair[0], pair[1]);
          }
        }

        return {
          url: "/api/v1/properties/create",
          method: "POST",
          body: formData,
        };
      },
    }),

    findMyProperties: builder.query<any, void>({
      query: () => ({
        url: "/api/v1/properties/my-listings",
        method: "GET",
      }),
    }),

    findPropertyById: builder.query<any, string>({
      query: (id) => ({
        url: `/api/v1/properties/${id}`,
        method: "GET",
      }),
    }),
    findPropertyByIdAndUpdate: builder.mutation<any, { id: string; data: any }>(
      {
        query: ({ id, data }) => ({
          url: `/api/v1/properties/${id}`,
          method: "PATCH",
          body: data,
        }),
      }
    ),
    findPropertyByIdAndDelete: builder.mutation<any, string>({
      query: (id) => ({
        url: `/api/v1/properties/${id}`,
        method: "DELETE",
      }),
    }),
    getAllProperties: builder.query<any, string>({
      query: (params) => ({
        url: `/api/v1/properties${params || ""}`,
        method: "GET",
      }),
    }),
    getFilterOptions: builder.query<any, void>({
      query: () => ({
        url: "/api/v1/properties/filters",
        method: "GET",
      }),
    }),

    getFilteredProperties: builder.query<
      any,
      {
        page?: number;
        limit?: number;
        city?: string;
        minRent?: number;
        maxRent?: number;
        bedrooms?: number;
        propertyType?: string;
      }
    >({
      query: ({
        page = 1,
        limit = 10,
        city,
        minRent,
        maxRent,
        bedrooms,
        propertyType,
      }) => {
        const params = new URLSearchParams();

        params.append("page", String(page));
        params.append("limit", String(limit));

        if (city) params.append("city", city);
        if (minRent) params.append("minRent", String(minRent));
        if (maxRent) params.append("maxRent", String(maxRent));
        if (bedrooms) params.append("bedrooms", String(bedrooms));
        if (propertyType) params.append("propertyType", propertyType);

        return {
          url: `/api/v1/properties/search?${params.toString()}`,
          method: "GET",
        };
      },
    }),
    getFeaturedProperties: builder.query<any, void>({
      query: () => ({
        url: `/api/v1/properties/featured`,
        method: "GET",
      }),
    }),
    AddToFav: builder.mutation<any, { propertyId: string }>({
      query: ({ propertyId }) => ({
        url: `/api/v1/favorites/${propertyId}`,
        method: "POST",
      }),
    }),
    getUserFavorites: builder.query<{ property: { _id: string }[] }, void>({
      query: () => "/api/v1/favorites",
    }),
    removeUserFavorite: builder.mutation<any, { propertyId: string }>({
      query: ({ propertyId }) => ({
        url: `/api/v1/favorites/${propertyId}`,
        method: "DELETE",
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
} = api;
