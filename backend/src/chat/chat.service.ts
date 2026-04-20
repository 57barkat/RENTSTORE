import {
  BadRequestException,
  ForbiddenException,
  Injectable,
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
    const sortedParticipantIds = [...new Set([userId, ...participants])].sort();
    const participantIds = sortedParticipantIds.map((id) => new Types.ObjectId(id));
    const roomKey = `${sortedParticipantIds.join(":")}:${propertyId || "general"}`;

    let room = await this.roomModel.findOne({ roomKey });

    if (!room) {
      room = await this.roomModel.findOne({
        participants: { $all: participantIds, $size: participantIds.length },
        propertyId: propertyId || null,
      });
    }

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
        roomKey,
        lastMessage: "",
        lastMessageAt: new Date(),
      });
    } else if (!room.roomKey) {
      room.roomKey = roomKey;
      await room.save();
    }

    return room;
  }

  async getUserRoomIds(userId: string): Promise<string[]> {
    if (!userId) return [];

    const userObjectId = new Types.ObjectId(userId);
    const rooms = await this.roomModel
      .find({ participants: userObjectId })
      .select("_id")
      .lean();

    return rooms.map((room) => room._id.toString());
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
      (participant) => participant.toString() === senderId.toString(),
    );

    if (!isParticipant) {
      throw new ForbiddenException("You are not a participant in this room");
    }

    const message = await this.messageModel.create({
      chatRoomId: new Types.ObjectId(chatRoomId),
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
      .lean();

    const roomIds = rooms.map((room) => new Types.ObjectId(room._id.toString()));

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

    const unreadCountMap = new Map(
      unreadCountsAgg.map((item) => [item._id.toString(), item.unreadCount]),
    );

    return rooms.map((room) => this.toRoomSummary(room, userId, unreadCountMap));
  }

  async getRoomSummary(roomId: string, userId: string) {
    if (!Types.ObjectId.isValid(roomId)) {
      throw new BadRequestException("Invalid Room ID format");
    }

    const room = await this.roomModel
      .findById(roomId)
      .populate("participants", "name profileImage email")
      .lean();

    if (!room) {
      throw new NotFoundException("Room not found");
    }

    const isParticipant = room.participants.some(
      (participant: any) => participant._id.toString() === userId.toString(),
    );
    if (!isParticipant) {
      throw new ForbiddenException("Access denied");
    }

    const userObjectId = new Types.ObjectId(userId);
    const unreadCount = await this.messageModel.countDocuments({
      chatRoomId: new Types.ObjectId(roomId),
      senderId: { $ne: userObjectId },
      readBy: { $nin: [userObjectId] },
    });

    return this.toRoomSummary(
      room,
      userId,
      new Map([[room._id.toString(), unreadCount]]),
    );
  }

  async getRoomParticipantIds(chatRoomId: string) {
    const room = await this.roomModel.findById(chatRoomId).select("participants");
    if (!room) {
      throw new NotFoundException("Chat room not found");
    }

    return room.participants.map((participant) => participant.toString());
  }

  async getRoomSummariesForParticipants(roomId: string, participantIds: string[]) {
    if (!Types.ObjectId.isValid(roomId)) {
      throw new BadRequestException("Invalid Room ID format");
    }

    const room = await this.roomModel
      .findById(roomId)
      .populate("participants", "name profileImage email")
      .lean();

    if (!room) {
      throw new NotFoundException("Room not found");
    }

    const unreadFacet = participantIds.reduce<Record<string, any[]>>(
      (accumulator, participantId) => {
        accumulator[participantId] = [
          {
            $match: {
              chatRoomId: new Types.ObjectId(roomId),
              senderId: { $ne: new Types.ObjectId(participantId) },
              readBy: { $nin: [new Types.ObjectId(participantId)] },
            },
          },
          { $count: "count" },
        ];
        return accumulator;
      },
      {},
    );

    const [unreadCountsAgg] = await this.messageModel.aggregate([
      { $facet: unreadFacet },
    ]);

    return participantIds.map((participantId) =>
      this.toRoomSummary(
        room,
        participantId,
        new Map([
          [room._id.toString(), unreadCountsAgg?.[participantId]?.[0]?.count || 0],
        ]),
      ),
    );
  }

  async getMessages(
    chatRoomId: string,
    userId: string,
    options?: { before?: string; limit?: number },
  ) {
    if (!Types.ObjectId.isValid(chatRoomId)) return { data: [], hasMore: false };

    const room = await this.roomModel.findById(chatRoomId);
    if (!room) throw new NotFoundException("Room not found");

    const isParticipant = room.participants.some(
      (participant) => participant.toString() === userId.toString(),
    );
    if (!isParticipant) throw new ForbiddenException("Access denied");

    const normalizedLimit = Math.min(Math.max(options?.limit ?? 50, 1), 100);
    const messageFilter: Record<string, any> = {
      chatRoomId: new Types.ObjectId(chatRoomId),
    };

    if (options?.before) {
      messageFilter.createdAt = { $lt: new Date(options.before) };
    }

    const messages = await this.messageModel
      .find(messageFilter)
      .populate("senderId", "name profileImage")
      .sort({ createdAt: -1 })
      .limit(normalizedLimit + 1)
      .lean();

    const hasMore = messages.length > normalizedLimit;
    const page = hasMore ? messages.slice(0, normalizedLimit) : messages;

    return {
      data: page.reverse(),
      hasMore,
    };
  }

  async markMessagesAsRead(chatRoomId: string, userId: string) {
    if (!Types.ObjectId.isValid(chatRoomId)) return;

    await this.messageModel.updateMany(
      {
        chatRoomId: new Types.ObjectId(chatRoomId),
        readBy: { $ne: new Types.ObjectId(userId) },
      },
      {
        $addToSet: { readBy: new Types.ObjectId(userId) },
      },
    );
  }

  private toRoomSummary(
    room: any,
    userId: string,
    unreadCountMap: Map<string, number>,
  ) {
    const otherUser = room.participants.find(
      (participant: any) => participant._id.toString() !== userId.toString(),
    );

    const roomId = room._id.toString();
    return {
      ...room,
      _id: roomId,
      otherUser: otherUser || null,
      unreadCount: unreadCountMap.get(roomId) || 0,
    };
  }
}
