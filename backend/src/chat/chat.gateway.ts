import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { JwtService } from "@nestjs/jwt";
import { ChatEventService } from "./chat-event.service";
import { ChatRealtimeService } from "./chat-realtime.service";
import { ChatService } from "./chat.service";
import { createSocketGatewayOptions } from "../common/utils/cors.util";
import { extractSocketToken } from "../common/utils/socket-auth.util";

@WebSocketGateway(createSocketGatewayOptions())
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatEventService: ChatEventService,
    private readonly chatRealtime: ChatRealtimeService,
    private readonly chatService: ChatService,
  ) {}

  afterInit(server: Server) {
    this.chatRealtime.bindServer(server);
  }

  async handleConnection(client: Socket) {
    try {
      const token = extractSocketToken(client);
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      client.data.userId = payload.sub;

      client.join(payload.sub.toString());

      const rooms = await this.chatService.getUserRooms(client.data.userId);
      rooms.forEach((room) => {
        if (room?._id) client.join(room._id.toString());
      });
    } catch (err) {
      client.disconnect();
    }
  }

  @SubscribeMessage("joinRoom")
  async joinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    if (roomId) client.join(roomId);
  }

  @SubscribeMessage("sendMessage")
  async sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatRoomId: string; text: string },
  ) {
    if (!data?.chatRoomId || !data?.text?.trim()) return;

    const senderId = client.data.userId;
    if (!senderId) return;

    const message = await this.chatService.saveMessage(
      senderId,
      data.chatRoomId,
      data.text.trim(),
    );

    const populatedMessage = await message.populate(
      "senderId",
      "name profileImage",
    );

    this.server.to(data.chatRoomId).emit("newMessage", populatedMessage);
    await this.chatEventService.publishNewMessage(
      data.chatRoomId,
      populatedMessage.toObject(),
    );

    const participantIds = await this.chatService.getRoomParticipantIds(
      data.chatRoomId,
    );

    await Promise.all(
      participantIds.map(async (participantId) => {
        const updatedRoom = await this.chatService.getRoomSummary(
          data.chatRoomId,
          participantId,
        );
        this.server.to(participantId).emit("roomUpdated", updatedRoom);
        await this.chatEventService.publishRoomUpdated(
          participantId,
          updatedRoom,
        );
      }),
    );
  }

  @SubscribeMessage("markAsRead")
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    if (!client.data.userId || !data?.roomId) return;

    try {
      await this.chatService.markMessagesAsRead(
        data.roomId,
        client.data.userId,
      );

      const updatedRoom = await this.chatService.getRoomSummary(
        data.roomId,
        client.data.userId,
      );
      this.server.to(client.data.userId).emit("roomUpdated", updatedRoom);
      await this.chatEventService.publishRoomUpdated(
        client.data.userId,
        updatedRoom,
      );
    } catch (err) {
      console.error("Mark as read error", err);
    }
  }
}
