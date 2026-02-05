import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { ChatRoom, ChatRoomDocument } from "./schemas/chat-room.schema";
import { Message, MessageDocument } from "./schemas/message.schema";

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatRoom.name)
    private roomModel: Model<ChatRoomDocument>,
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,
  ) {}

  async createOrGetRoom(
    userId: string,
    participants: string[],
    propertyId?: string,
  ) {
    const allUsers = [...new Set([userId, ...participants])].sort();
    let room = await this.roomModel.findOne({
      participants: { $all: allUsers, $size: allUsers.length },
      propertyId: propertyId || null,
    });

    if (!room && propertyId) {
      room = await this.roomModel.findOne({
        participants: { $all: allUsers, $size: allUsers.length },
        propertyId: null,
      });
    }

    if (!room) {
      room = await this.roomModel.create({
        participants: allUsers,
        isGroup: allUsers.length > 2,
        propertyId: propertyId || null,
        lastMessage: "",
        lastMessageAt: new Date(),
      });
    }

    return room;
  }

  async getUserRooms(userId: string): Promise<ChatRoomDocument[]> {
    if (!userId) return [];
    return this.roomModel
      .find({ participants: userId })
      .sort({ lastMessageAt: -1 })
      .exec();
  }

  async saveMessage(senderId: string, chatRoomId: string, text: string) {
    if (!Types.ObjectId.isValid(chatRoomId)) {
      throw new BadRequestException("Invalid Room ID format");
    }

    const room = await this.roomModel.findById(chatRoomId);
    if (!room) {
      throw new NotFoundException("Chat room not found");
    }

    const participants = room.participants || [];
    const isParticipant = participants.some(
      (p) => p?.toString() === senderId.toString(),
    );

    if (!isParticipant) {
      throw new ForbiddenException("You are not a participant in this room");
    }

    const message = await this.messageModel.create({
      chatRoomId,
      senderId,
      text,
    });

    room.lastMessage = text;
    room.lastMessageAt = new Date();
    await room.save();

    return message;
  }

  async getMessages(chatRoomId: string, userId: string) {
    if (!Types.ObjectId.isValid(chatRoomId)) return [];

    const room = await this.roomModel.findById(chatRoomId);

    if (!room) throw new NotFoundException("Room not found");

    const isParticipant = room.participants?.some(
      (p) => p?.toString() === userId.toString(),
    );
    if (!isParticipant) throw new ForbiddenException("Access denied");

    return this.messageModel.find({ chatRoomId }).sort({ createdAt: 1 });
  }
}
