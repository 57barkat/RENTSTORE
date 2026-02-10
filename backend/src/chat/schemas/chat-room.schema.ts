import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ChatRoomDocument = ChatRoom & Document;

@Schema({ timestamps: true })
export class ChatRoom {
  @Prop({ type: [{ type: Types.ObjectId, ref: "User" }], required: true })
  participants: Types.ObjectId[];

  @Prop({ type: Boolean, default: false })
  isGroup: boolean;

  @Prop({ type: String, default: null })
  propertyId: string | null;

  @Prop({ type: String, default: "" })
  lastMessage: string;

  @Prop({ type: Date, default: Date.now })
  lastMessageAt: Date;
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);
