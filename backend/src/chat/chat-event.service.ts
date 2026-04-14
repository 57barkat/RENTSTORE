import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { randomUUID } from "crypto";
import { ChangeStream } from "mongodb";
import { Model } from "mongoose";
import { ChatRealtimeService } from "./chat-realtime.service";
import { ChatEvent, ChatEventDocument, ChatEventType } from "./schemas/chat-event.schema";

@Injectable()
export class ChatEventService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ChatEventService.name);
  private readonly instanceId = randomUUID();
  private changeStream: ChangeStream | null = null;
  private readonly eventBusEnabled =
    process.env.CHAT_EVENT_BUS_ENABLED === "true" ||
    process.env.NODE_ENV === "production";

  constructor(
    @InjectModel(ChatEvent.name)
    private readonly chatEventModel: Model<ChatEventDocument>,
    private readonly chatRealtime: ChatRealtimeService,
  ) {}

  async onModuleInit() {
    if (!this.eventBusEnabled) {
      return;
    }

    try {
      this.changeStream = this.chatEventModel.watch([
        { $match: { operationType: "insert" } },
      ]);

      this.changeStream.on("change", (change: any) => {
        const event = change.fullDocument as ChatEvent | undefined;
        if (!event || event.originInstanceId === this.instanceId) {
          return;
        }

        if (event.type === ChatEventType.NEW_MESSAGE && event.targetRoomId) {
          this.chatRealtime.emitToRoom(
            event.targetRoomId,
            "newMessage",
            event.payload,
          );
        }

        if (event.type === ChatEventType.ROOM_UPDATED && event.targetUserId) {
          this.chatRealtime.emitToUser(
            event.targetUserId,
            "roomUpdated",
            event.payload,
          );
        }
      });

      this.changeStream.on("error", (error) => {
        this.logger.error(`Chat event stream error: ${String(error)}`);
      });
    } catch (error) {
      this.logger.error(`Failed to start chat event stream: ${String(error)}`);
    }
  }

  async onModuleDestroy() {
    await this.changeStream?.close();
  }

  async publishNewMessage(targetRoomId: string, payload: Record<string, any>) {
    if (!this.eventBusEnabled) return;

    await this.chatEventModel.create({
      type: ChatEventType.NEW_MESSAGE,
      originInstanceId: this.instanceId,
      targetRoomId,
      payload,
    });
  }

  async publishRoomUpdated(targetUserId: string, payload: Record<string, any>) {
    if (!this.eventBusEnabled) return;

    await this.chatEventModel.create({
      type: ChatEventType.ROOM_UPDATED,
      originInstanceId: this.instanceId,
      targetUserId,
      payload,
    });
  }
}
