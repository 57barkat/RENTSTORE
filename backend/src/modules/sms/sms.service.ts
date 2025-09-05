import { Injectable } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class SmsService {
  private readonly baseUrl = process.env.SMS_BASE_URL!;
  private readonly apiKey = process.env.SMS_API_KEY!;
  private readonly deviceId = process.env.SMS_DEVICE_ID!;

  async sendOtp(phoneNumber: string, otp: string) {
    try {
      const res = await axios.post(
        `${this.baseUrl}/gateway/devices/${this.deviceId}/send-sms`,
        {
          recipients: [phoneNumber],
          message: `Your OTP code is: ${otp}`,
        },
        {
          headers: { 'x-api-key': this.apiKey },
        },
      );
      return res.data;
    } catch (error: any) {
      console.error('SMS API error:', {
        status: error.response?.status,
        data: error.response?.data,
      });
      throw new Error(
        'Failed to send SMS: ' +
          (error.response?.data?.message || error.message),
      );
    }
  }
}
