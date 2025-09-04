import { Controller, Post, Body } from '@nestjs/common';
import { SmsService } from './sms.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly smsService: SmsService) {}

  @Post('send-otp')
  async sendOtp(@Body('phone') phone: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await this.smsService.sendOtp(phone, otp);
    return { success: true, otp };
  }
}
