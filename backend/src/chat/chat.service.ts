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
    const participantIds = [...new Set([userId, ...participants])]
      .map((id) => new Types.ObjectId(id))
      .sort();

    let room = await this.roomModel.findOne({
      participants: { $all: participantIds, $size: participantIds.length },
      propertyId: propertyId || null,
    });

    if (!room && propertyId) {
      room = await this.roomModel.findOne({
        participants: { $all: participantIds, $size: participantIds.length },
        propertyId: null,
      });
    }

    if (!room) {
      room = await this.roomModel.create({
        participants: participantIds,
        isGroup: participantIds.length > 2,
        propertyId: propertyId || null,
        lastMessage: "",
        lastMessageAt: new Date(),
      });
    }

    return room;
  }

  async saveMessage(senderId: string, chatRoomId: string, text: string) {
    if (!Types.ObjectId.isValid(chatRoomId)) {
      throw new BadRequestException("Invalid Room ID format");
    }

    const room = await this.roomModel.findById(chatRoomId);
    if (!room) {
      throw new NotFoundException("Chat room not found");
    }

    const isParticipant = room.participants.some(
      (p) => p.toString() === senderId.toString(),
    );

    if (!isParticipant) {
      throw new ForbiddenException("You are not a participant in this room");
    }

    const message = await this.messageModel.create({
      chatRoomId,
      senderId: new Types.ObjectId(senderId),
      text,
    });

    room.lastMessage = text;
    room.lastMessageAt = new Date();
    await room.save();

    return message;
  }

  async getUserRooms(userId: string): Promise<any[]> {
    if (!userId) return [];
    const rooms = await this.roomModel
      .find({ participants: new Types.ObjectId(userId) })
      .populate("participants", "name profileImage email")
      .sort({ lastMessageAt: -1 })
      .exec();

    // We map the rooms to explicitly define who the "other" person is
    return rooms.map((room) => {
      const roomObj = room.toObject();
      const otherUser = roomObj.participants.find(
        (p: any) => p._id.toString() !== userId.toString(),
      );
      return {
        ...roomObj,
        otherUser: otherUser || null,
      };
    });
  }

  async getMessages(chatRoomId: string, userId: string) {
    if (!Types.ObjectId.isValid(chatRoomId)) return [];

    const room = await this.roomModel.findById(chatRoomId);
    if (!room) throw new NotFoundException("Room not found");

    const isParticipant = room.participants.some(
      (p) => p.toString() === userId.toString(),
    );
    if (!isParticipant) throw new ForbiddenException("Access denied");

    // Populate senderId so we always have the image and name for every message
    return this.messageModel
      .find({ chatRoomId })
      .populate("senderId", "name profileImage")
      .sort({ createdAt: 1 })
      .exec();
  }
}
