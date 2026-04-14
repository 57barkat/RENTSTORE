import { api } from "@/services/api";

export const chatApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /* -------------------- Create Room -------------------- */
    createRoom: builder.mutation<
      any,
      { participants: string[]; propertyId?: string }
    >({
      query: (body) => ({
        url: "/api/v1/chat/rooms",
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

    getMessages: builder.query<
      { data: any[]; hasMore: boolean },
      { roomId: string; before?: string; limit?: number }
    >({
      query: ({ roomId, before, limit = 50 }) => ({
        url: `/api/v1/chat/messages/${roomId}`,
        method: "GET",
        params: {
          ...(before ? { before } : {}),
          limit,
        },
      }),
    }),
  }),
});

export const {
  useCreateRoomMutation,
  useGetRoomsQuery,
  useGetMessagesQuery,
  useLazyGetMessagesQuery,
} = chatApi;
