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
      readBy: [new Types.ObjectId(senderId)],
    });

    room.lastMessage = text;
    room.lastMessageAt = new Date();
    await room.save();

    return message;
  }

  async getUserRooms(userId: string): Promise<any[]> {
    if (!userId) return [];

    const userObjectId = new Types.ObjectId(userId);

    const rooms = await this.roomModel
      .find({ participants: userObjectId })
      .populate("participants", "name profileImage email")
      .sort({ lastMessageAt: -1 })
      .exec();

    const roomIds = rooms.map((room) =>
      (room._id as Types.ObjectId | string).toString(),
    );

    const unreadCountsAgg = await this.messageModel.aggregate([
      {
        $match: {
          chatRoomId: { $in: roomIds },
          senderId: { $ne: userObjectId },
          readBy: { $nin: [userObjectId] },
        },
      },
      {
        $group: {
          _id: "$chatRoomId",
          unreadCount: { $sum: 1 },
        },
      },
    ]);

    const unreadCountMap: Record<string, number> = {};
    unreadCountsAgg.forEach((item) => {
      unreadCountMap[item._id] = item.unreadCount;
    });

    const results = rooms.map((room) => {
      const roomObj = room.toObject();
      const otherUser = roomObj.participants.find(
        (p: any) => p._id.toString() !== userId.toString(),
      );

      const roomIdStr = (room._id as Types.ObjectId | string).toString();
      return {
        ...roomObj,
        otherUser: otherUser || null,
        unreadCount: unreadCountMap[roomIdStr] || 0,
      };
    });

    return results;
  }
  async getMessages(chatRoomId: string, userId: string) {
    if (!Types.ObjectId.isValid(chatRoomId)) return [];

    const room = await this.roomModel.findById(chatRoomId);
    if (!room) throw new NotFoundException("Room not found");

    const isParticipant = room.participants.some(
      (p) => p.toString() === userId.toString(),
    );
    if (!isParticipant) throw new ForbiddenException("Access denied");

    return this.messageModel
      .find({ chatRoomId })
      .populate("senderId", "name profileImage")
      .sort({ createdAt: 1 })
      .exec();
  }
  async markMessagesAsRead(chatRoomId: string, userId: string) {
    if (!Types.ObjectId.isValid(chatRoomId)) return;

    await this.messageModel.updateMany(
      {
        chatRoomId,
        readBy: { $ne: new Types.ObjectId(userId) },
      },
      {
        $addToSet: { readBy: new Types.ObjectId(userId) },
      },
    );
  }
}
