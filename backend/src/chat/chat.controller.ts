import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  BadRequestException,
  Param,
} from "@nestjs/common";
import { ChatService } from "./chat.service";
import { AuthGuard } from "@nestjs/passport";

@Controller("chat")
@UseGuards(AuthGuard("jwt"))
export class ChatController {
  constructor(private chatService: ChatService) {}

  /* -------------------- Create or Get Room -------------------- */
  @Post("room")
  async createOrGetRoom(
    @Req() req,
    @Body() body: { participants: string[]; propertyId?: string }
  ) {
    if (!body?.participants?.length) {
      throw new BadRequestException("Participants are required");
    }

    const room = await this.chatService.createOrGetRoom(
      req.user.sub, // current logged-in user
      body.participants, // other participants
      body.propertyId // optional propertyId for context
    );

    // Return only relevant info for frontend
    return {
      _id: room._id,
      participants: room.participants,
      isGroup: room.isGroup,
      propertyId: room.propertyId,
      lastMessage: room.lastMessage,
    };
  }

  /* -------------------- Get User Rooms -------------------- */
  @Get("rooms")
  async getRooms(@Req() req) {
    const rooms = await this.chatService.getUserRooms(req.user.sub);

    // Map to frontend-friendly structure
    return rooms.map((room) => ({
      _id: room._id,
      participants: room.participants,
      isGroup: room.isGroup,
      propertyId: room.propertyId,
      lastMessage: room.lastMessage,
    }));
  }

  /* -------------------- Get Messages for a Room -------------------- */
  @Get("messages/:roomId")
  async getMessages(@Req() req, @Param("roomId") roomId: string) {
    if (!roomId) throw new BadRequestException("roomId is required");

    const messages = await this.chatService.getMessages(roomId, req.user.sub);

    // Map messages to include senderId for frontend rendering
    return messages.map((msg) => ({
      _id: msg._id,
      chatRoomId: msg.chatRoomId,
      senderId: msg.senderId,
      text: msg.text,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
    }));
  }
}
