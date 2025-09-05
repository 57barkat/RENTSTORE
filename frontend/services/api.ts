import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.EXPO_PUBLIC_API_URL || "http://172.16.18.99:3000",
    prepareHeaders: async (headers) => {
      const token = await AsyncStorage.getItem('accessToken');
      console.log(token);
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
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

    createProperty: builder.mutation<any, any>({
      query: (body) => {
        const formData = new FormData();
        Object.entries(body).forEach(([key, value]) => {
          if (key === "photos" || key === "videos") return;
          if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });
        if (body.photos && Array.isArray(body.photos)) {
          body.photos.forEach((photo: any, idx: number) => {
            if (photo && photo.uri && (photo.mimeType || photo.type) && (photo.fileName || photo.name)) {
              formData.append("files", {
                uri: photo.uri,
                name: photo.fileName || photo.name || `photo_${idx}.jpg`,
                type: photo.mimeType || photo.type || "image/jpeg",
              } as any);
            }
          });
        }
        if (body.videos && Array.isArray(body.videos)) {
          body.videos.forEach((video: any, idx: number) => {
            if (video && video.uri && (video.mimeType || video.type) && (video.fileName || video.name)) {
              formData.append("files", {
                uri: video.uri,
                name: video.fileName || video.name || `video_${idx}.mp4`,
                type: video.mimeType || video.type || "video/mp4",
              } as any);
            }
          });
        }
        // Debug log for FormData keys
        // @ts-ignore
        if (__DEV__) {
          // @ts-ignore
          for (let pair of formData._parts || []) {
            console.log('FormData:', pair[0], pair[1]);
          }
        }
        return {
          url: "/api/v1/properties/create",
          method: "POST",
          body: formData,
        };
      },
    }),
  }),
});

export const {
  useCreateUserMutation,
  useLoginMutation,
  useCreatePropertyMutation,
} = api;
