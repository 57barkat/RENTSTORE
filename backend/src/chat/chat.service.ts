import { Injectable, ForbiddenException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ChatRoom, ChatRoomDocument } from "./schemas/chat-room.schema";
import { Message, MessageDocument } from "./schemas/message.schema";

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatRoom.name)
    private roomModel: Model<ChatRoomDocument>,
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>
  ) {}

  /* -------------------- Create or Get Room -------------------- */
  async createOrGetRoom(
    userId: string,
    participants: string[],
    propertyId?: string
  ) {
    const allUsers = [...new Set([userId, ...participants])];

    let room = await this.roomModel.findOne({
      participants: { $all: allUsers, $size: allUsers.length },
      propertyId: propertyId || null,
      isGroup: allUsers.length > 2,
    });

    if (!room) {
      room = await this.roomModel.create({
        participants: allUsers,
        isGroup: allUsers.length > 2,
        propertyId: propertyId || null,
      });
    }

    return room;
  }

  /* -------------------- Get User Rooms -------------------- */
  async getUserRooms(userId: string): Promise<ChatRoomDocument[]> {
    return this.roomModel
      .find({ participants: userId })
      .sort({ updatedAt: -1 })
      .exec();
  }

  /* -------------------- Get Room By ID -------------------- */
  async getRoomById(chatRoomId: string): Promise<ChatRoomDocument | null> {
    return this.roomModel.findById(chatRoomId);
  }

  /* -------------------- Save Message -------------------- */
  async saveMessage(senderId: string, chatRoomId: string, text: string) {
    const room = await this.roomModel.findById(chatRoomId);
    if (!room || !room.participants.includes(senderId)) {
      throw new ForbiddenException("Access denied");
    }

    const message = await this.messageModel.create({
      chatRoomId,
      senderId,
      text,
    });

    room.lastMessage = text;
    await room.save();

    return message;
  }

  /* -------------------- Get Messages -------------------- */
  async getMessages(chatRoomId: string, userId: string) {
    const room = await this.roomModel.findById(chatRoomId);
    if (!room || !room.participants.includes(userId)) {
      throw new ForbiddenException("Access denied");
    }

    return this.messageModel.find({ chatRoomId }).sort({ createdAt: 1 });
  }
}
