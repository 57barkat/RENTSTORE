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
            console.log("FormData:", pair[0], pair[1]);
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
  }),
});

export const {
  useCreateUserMutation,
  useLoginMutation,
  useCreatePropertyMutation,
  useFindMyPropertiesQuery,
} = api;
