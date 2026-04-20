import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, required: true, ref: "ChatRoom" })
  chatRoomId!: string;

  @Prop({ type: Types.ObjectId, required: true, ref: "User" })
  senderId!: Types.ObjectId;

  @Prop({ type: String, required: true })
  text!: string;
  @Prop({ type: [{ type: Types.ObjectId, ref: "User" }], default: [] })
  readBy!: Types.ObjectId[];
  @Prop(() => Date)
  createdAt!: Date;

  @Prop(() => Date)
  updatedAt!: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
MessageSchema.index({ chatRoomId: 1, createdAt: 1 });
MessageSchema.index({ chatRoomId: 1, senderId: 1, createdAt: -1 });
