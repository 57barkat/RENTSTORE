import { Injectable } from "@nestjs/common";
import { Server } from "socket.io";

@Injectable()
export class ChatRealtimeService {
  private server: Server | null = null;

  bindServer(server: Server) {
    this.server = server;
  }

  emitToRoom(roomId: string, event: string, payload: unknown) {
    this.server?.to(roomId).emit(event, payload);
  }

  emitToUser(userId: string, event: string, payload: unknown) {
    this.server?.to(userId).emit(event, payload);
  }
}
