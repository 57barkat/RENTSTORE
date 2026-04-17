import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  SubscribeMessage,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";

@WebSocketGateway({ cors: { origin: "*" } })
export class PaymentSocketGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(PaymentSocketGateway.name);

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      client.join(userId);
      this.logger.log(`User ${userId} joined their private payment room.`);
    }
  }

  emitSubscriptionMessage(userId: string, message: string) {
    this.server.to(userId).emit("SUBSCRIPTION_MESSAGE", {
      refreshAuth: true,
      message: message,
    });
  }
}
