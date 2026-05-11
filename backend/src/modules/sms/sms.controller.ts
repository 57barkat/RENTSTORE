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
import { OtpStoreService } from "./otp-store.service";
import { RateLimit } from "../../common/decorators/rate-limit.decorator";
import { SendOtpDto, VerifyOtpDto } from "./dto/otp.dto";

const OTP_TTL_MS = 5 * 60 * 1000;

@UseGuards(AuthGuard("jwt"))
@Controller("auth")
export class AuthController {
  constructor(
    private readonly smsService: SmsService,
    private readonly userService: UserService,
    private readonly otpStoreService: OtpStoreService,
  ) {}

  @Post("send-otp")
  @RateLimit({ limit: 5, windowMs: 10 * 60 * 1000, scope: "user" })
  async sendOtp(@Body() dto: SendOtpDto) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const phone = dto.phone;

    await this.otpStoreService.set(this.getOtpKey(phone), otp, OTP_TTL_MS);
    const user = await this.userService.findByPhone(phone);
    if (!user) throw new BadRequestException("incorrect phone number");
    await this.smsService.sendOtp(phone, otp);
    return { success: true, message: "OTP sent successfully" };
  }

  @Post("verify-otp")
  @RateLimit({ limit: 10, windowMs: 10 * 60 * 1000, scope: "user" })
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
  ): Promise<{ success: boolean; message: string }> {
    const { phone, otp } = dto;
    const storedOtp = await this.otpStoreService.get(this.getOtpKey(phone));

    if (!storedOtp) throw new BadRequestException("No OTP sent or expired");
    if (storedOtp !== otp) throw new BadRequestException("Invalid OTP");

    await this.otpStoreService.delete(this.getOtpKey(phone));

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

  private getOtpKey(phone: string) {
    return `otp:${phone}`;
  }
}
