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
import { ChatService } from "./chat.service";
import { Types } from "mongoose";

@WebSocketGateway({ cors: { origin: "*" } })
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService
  ) {}

  /* -------------------- Handle Socket Connection -------------------- */
  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      client.data.userId = payload.sub;

      // Join all rooms automatically
      const rooms = await this.chatService.getUserRooms(client.data.userId);
      rooms.forEach((room) =>
        client.join((room._id as Types.ObjectId).toString())
      );
    } catch (err) {
      client.disconnect();
    }
  }

  /* -------------------- Join Room -------------------- */
  @SubscribeMessage("joinRoom")
  async joinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string
  ) {
    if (roomId) client.join(roomId);
  }

  /* -------------------- Send Message -------------------- */
  @SubscribeMessage("sendMessage")
  async sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatRoomId: string; text: string }
  ) {
    if (!data?.chatRoomId || !data?.text?.trim()) return;

    const senderId = client.data.userId;
    if (!senderId) return;

    const message = await this.chatService.saveMessage(
      senderId,
      data.chatRoomId,
      data.text.trim()
    );

    this.server.to(data.chatRoomId).emit("newMessage", message);
  }
}
