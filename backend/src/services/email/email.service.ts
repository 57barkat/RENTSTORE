import { Injectable } from "@nestjs/common";
import { Resend } from "resend";

@Injectable()
export class EmailService {
  private resend = new Resend(process.env.RESEND_API_KEY);

  async sendVerificationEmail(email: string, code: string) {
    // ✅ Debug logs
    console.log("📧 Sending verification email to:", email);
    console.log("🔑 API KEY Loaded:", !!process.env.RESEND_API_KEY);

    try {
      const response = await this.resend.emails.send({
        from: "contact@binaryscripters.co.uk",
        to: email,
        subject: "Verify your email",
        html: `<h2>Your verification code</h2><h1>${code}</h1>`,
        text: `YOUR VERIFICATION CODE: ${code}`,
        replyTo: "contact@binaryscripters.co.uk",
      });

      return response;
    } catch (error) {
      console.error("❌ Email sending failed:", error);
      throw new Error("Failed to send verification email");
    }
  }
}
