import { api } from "@/services/api";

export const chatApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /* -------------------- Create Room -------------------- */
    createRoom: builder.mutation<{ _id: string }, { participants: string[] }>({
      query: (body) => ({
        url: "/api/v1/chat/room",
        method: "POST",
        body,
      }),
    }),

    /* -------------------- Get User Rooms -------------------- */
    getRooms: builder.query<any[], void>({
      query: () => ({
        url: "/api/v1/chat/rooms",
        method: "GET",
      }),
    }),

    /* -------------------- Get Messages (NO SKIP) -------------------- */
    getMessages: builder.query<any[], { roomId: string }>({
      query: ({ roomId }) => ({
        url: `/api/v1/chat/messages/${roomId}`,
        method: "GET",
      }),
    }),
  }),
});

export const { useCreateRoomMutation, useGetRoomsQuery, useGetMessagesQuery } =
  chatApi;
