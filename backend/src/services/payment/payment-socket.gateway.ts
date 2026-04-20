import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { createSocketGatewayOptions } from "../../common/utils/cors.util";
import { extractSocketToken } from "../../common/utils/socket-auth.util";

@WebSocketGateway(createSocketGatewayOptions())
export class PaymentSocketGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(PaymentSocketGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: Socket) {
    try {
      const token = extractSocketToken(client);
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      const userId = payload?.sub?.toString();
      if (!userId) {
        client.disconnect();
        return;
      }

      client.data.userId = userId;
      client.join(userId);
      this.logger.log(`User ${userId} joined their private payment room.`);
    } catch (error) {
      client.disconnect();
    }
  }

  emitSubscriptionMessage(userId: string, message: string) {
    this.server.to(userId).emit("SUBSCRIPTION_MESSAGE", {
      refreshAuth: true,
      message: message,
    });
  }
}
