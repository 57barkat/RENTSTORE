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
import { diskStorage } from "multer";
import { extname } from "path";
import { VoiceSearchService } from "./voice-search.service";
import * as fs from "fs";
import { AuthGuard } from "@nestjs/passport";
@UseGuards(AuthGuard("jwt"))
@Controller("search")
export class VoiceSearchController {
  constructor(private readonly service: VoiceSearchService) {
    const uploadDir = "./uploads";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
  }

  @Post("voice")
  @UseInterceptors(
    FileInterceptor("audio", {
      storage: diskStorage({
        destination: "./uploads",
        filename: (_req, file, cb) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
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
}
