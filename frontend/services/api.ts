import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.EXPO_PUBLIC_API_URL || "http://172.16.18.99:3000",
  }),
  endpoints: (builder) => ({
    createUser: builder.mutation<any, any>({
      query: (body) => ({
        url: "/api/v1/users/signup", 
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useCreateUserMutation } = api;
