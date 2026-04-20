import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type ChatEventDocument = ChatEvent & Document;

export enum ChatEventType {
  NEW_MESSAGE = "NEW_MESSAGE",
  ROOM_UPDATED = "ROOM_UPDATED",
}

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class ChatEvent {
  @Prop({ required: true, enum: ChatEventType })
  type!: ChatEventType;

  @Prop({ required: true })
  originInstanceId!: string;

  @Prop()
  targetRoomId?: string;

  @Prop()
  targetUserId?: string;

  @Prop({ type: Object, required: true })
  payload!: Record<string, any>;

  @Prop()
  createdAt!: Date;
}

export const ChatEventSchema = SchemaFactory.createForClass(ChatEvent);
ChatEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });
