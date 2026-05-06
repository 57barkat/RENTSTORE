import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtModule } from "@nestjs/jwt";
import { ChatGateway } from "./chat.gateway";
import { ChatEventService } from "./chat-event.service";
import { ChatRealtimeService } from "./chat-realtime.service";
import { ChatService } from "./chat.service";
import { ChatController } from "./chat.controller";
import { ChatEvent, ChatEventSchema } from "./schemas/chat-event.schema";
import { ChatRoom, ChatRoomSchema } from "./schemas/chat-room.schema";
import { Message, MessageSchema } from "./schemas/message.schema";

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>("app.jwtSecret", {
          infer: true,
        }),
        signOptions: {
          expiresIn:
            configService.get<string>("app.jwtExpiresIn", { infer: true }) ||
            "15m",
        },
      }),
    }),
    MongooseModule.forFeature([
      { name: ChatEvent.name, schema: ChatEventSchema },
      { name: ChatRoom.name, schema: ChatRoomSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
  ],
  providers: [ChatGateway, ChatService, ChatRealtimeService, ChatEventService],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}
