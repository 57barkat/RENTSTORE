import {
  Controller,
  Post,
  Get,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ProfileService } from "./profile.service";
import { AuthGuard } from "@nestjs/passport";

@UseGuards(AuthGuard("jwt"))
@Controller("user")
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // Upload profile image
  @Post("profile-image")
  @UseInterceptors(FileInterceptor("file"))
  async uploadProfileImage(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File
  ) {
    console.log("File uploaded:", file);
    const userId = req.user.userId;
    return this.profileService.uploadProfileImage(userId, file);
  }

  // Get user stats/profile info
  @Get("stats")
  async getUserStats(@Req() req: any) {
    const userId = req.user.userId;
    return this.profileService.getUserStats(userId);
  }
}
