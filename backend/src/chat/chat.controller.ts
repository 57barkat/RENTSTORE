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

  @Post("rooms")
  async createOrGetRoom(
    @Req() req,
    @Body() body: { participants: string[]; propertyId?: string },
  ) {
    if (!body?.participants?.length) {
      throw new BadRequestException("Participants are required");
    }

    const room = await this.chatService.createOrGetRoom(
      req.user.userId,
      body.participants,
      body.propertyId,
    );

    return room;
  }

  @Get("rooms")
  async getRooms(@Req() req) {
    return await this.chatService.getUserRooms(req.user.userId);
  }

  @Get("messages/:roomId")
  async getMessages(@Req() req, @Param("roomId") roomId: string) {
    if (!roomId) throw new BadRequestException("roomId is required");
    return await this.chatService.getMessages(roomId, req.user.userId);
  }
}
