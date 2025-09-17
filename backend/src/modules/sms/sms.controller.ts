import {
  Controller,
  Post,
  Body,
  BadRequestException,
  UseGuards,
} from "@nestjs/common";
import { SmsService } from "./sms.service";
import { UserService } from "../user/user.service";
import { AuthGuard } from "@nestjs/passport";
import { User } from "../user/user.entity";
@UseGuards(AuthGuard("jwt"))
@Controller("auth")
export class AuthController {
  private otpStore = new Map<string, { otp: string; expiresAt: number }>();

  constructor(
    private readonly smsService: SmsService,

    private readonly userService: UserService
  ) {}

  @Post("send-otp")
  async sendOtp(@Body("phone") phone: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    this.otpStore.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    await this.smsService.sendOtp(phone, otp);
    return { success: true, message: "OTP sent successfully" };
  }

  @Post("verify-otp")
  async verifyOtp(
    @Body("phone") phone: string,
    @Body("otp") otp: string
  ): Promise<{ success: boolean; message: string }> {
    const record = this.otpStore.get(phone);

    if (!record) throw new BadRequestException("No OTP sent or expired");
    if (record.expiresAt < Date.now()) {
      this.otpStore.delete(phone);
      throw new BadRequestException("OTP expired");
    }
    if (record.otp !== otp) throw new BadRequestException("Invalid OTP");

    this.otpStore.delete(phone);

    const user = await this.userService.findByPhone(phone);
    if (!user) throw new BadRequestException("User not found");

    await this.userService.update(user.id.toString(), {
      isPhoneVerified: true,
    });

    return {
      success: true,
      message: "Phone verified successfully",
    };
  }
}
