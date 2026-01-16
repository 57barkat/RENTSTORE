import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Req,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { VoiceSearchService } from "./voice-search.service";
import * as fs from "fs";

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
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
    })
  )
  async voiceSearch(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any
  ) {
    const userId = req.user?.userId;

    if (!file) {
      throw new BadRequestException("Audio file is required");
    }

    return this.service.voiceSearch(file, userId);
  }
}
