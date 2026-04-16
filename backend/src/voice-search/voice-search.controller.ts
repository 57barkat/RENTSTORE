import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Req,
  BadRequestException,
  UseGuards,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { VoiceSearchService } from "./voice-search.service";
import { AuthGuard } from "@nestjs/passport";
import { RateLimit } from "../common/decorators/rate-limit.decorator";
@UseGuards(AuthGuard("jwt"))
@Controller("search")
export class VoiceSearchController {
  constructor(private readonly service: VoiceSearchService) {}

  @Post("voice")
  @RateLimit({ limit: 10, windowMs: 10 * 60 * 1000, scope: "user" })
  @UseInterceptors(
    FileInterceptor("audio", {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async voiceSearch(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    const userId: string | undefined = req.user?.userId;
    if (!file) throw new BadRequestException("Audio file is required");
    if (!userId) throw new BadRequestException("User not authenticated");

    return this.service.voiceSearch(file, userId);
  }
  @Post("voice/cancel")
  async cancelVoiceSession(@Req() req: any) {
    const userId: string | undefined = req.user?.userId;
    if (!userId) throw new BadRequestException("User not authenticated");

    await this.service.clearSession(userId);
    return { message: "Voice session cleared" };
  }
}
