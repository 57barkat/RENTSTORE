import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, required: true, ref: "ChatRoom" })
  chatRoomId: string;

  @Prop({ type: String, required: true })
  senderId: string;

  @Prop({ type: String, default: null })
  text: string;

  @Prop(() => Date)
  createdAt: Date;

  @Prop(() => Date)
  updatedAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
