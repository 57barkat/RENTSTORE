import { PaymentSocketGateway } from "src/services/payment/payment-socket.gateway";
import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
  Req,
  Get,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import * as crypto from "crypto";
import { Response } from "express";
import { UserService } from "src/modules/user/user.service";
import { PaymentService } from "./payment.service";
import { Public } from "src/common/decorators/public.decorator";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";

@Controller("payments")
export class PaymentController {
  constructor(
    private readonly userService: UserService,
    private readonly paymentService: PaymentService,
    private readonly paymentGateway: PaymentSocketGateway,
  ) {}

  @Public()
  @Post("create-checkout")
  async createCheckout(@Body() body: { userId: string; packageId: string }) {
    return this.paymentService.createCheckout(body.userId, body.packageId);
  }
  @Public()
  @Get("payment-success")
  async handlePaymentSuccess(
    @Query("tracker") tracker: string,
    @Res() res: any,
  ) {
    const redirectUrl = `rentstoreapp://shop/BuyCredits?tracker=${tracker}`;
    return res.setHeader("Content-Type", "text/html").send(`
      <html>
        <body style="text-align:center; padding-top:50px; font-family: sans-serif;">
          <script>window.location.href = "${redirectUrl}";</script>
          <h2>Payment Successful!</h2>
          <p>Redirecting you back to Rent Store...</p>
        </body>
      </html>
    `);
  }

  @Public()
  @Post("safepay-webhook")
  async handleSafepayWebhook(
    @Req() req: any,
    @Body() body: any,
    @Headers("x-sfpy-signature") signature: string,
  ) {
    const secret = process.env.SAFEPAY_WEBHOOK_SECRET;
    const token = body.data?.token;
    const notification = body.data?.notification;

    if (!token || !secret) return { status: "ignored" };

    const tokenSha512 = crypto
      .createHmac("sha512", secret)
      .update(token)
      .digest("hex");
    const dataString = JSON.stringify(body.data);
    const dataSha512 = crypto
      .createHmac("sha512", secret)
      .update(dataString)
      .digest("hex");

    let match = signature === tokenSha512 || signature === dataSha512;
    if (!match && req.rawBody) {
      const rawSha512 = crypto
        .createHmac("sha512", secret)
        .update(req.rawBody)
        .digest("hex");
      if (signature === rawSha512) match = true;
    }

    if (!match) throw new BadRequestException("Signature Mismatch");

    try {
      console.log("✅ Webhook Verified. Tracker:", notification?.tracker);

      if (notification?.state === "PAID") {
        const trackerId = notification.tracker;

        const localPayment =
          await this.paymentService.getInternalPaymentByTracker(trackerId);

        if (localPayment && localPayment.status === "pending") {
          const { userId, packageId } = localPayment;

          console.log(`💰 SUCCESS: Granting ${packageId} to User ${userId}`);

          await this.userService.handleSuccessfulPayment(
            userId.toString(),
            packageId,
          );

          await this.paymentService.markInternalPaymentAsCompleted(trackerId);
          this.paymentGateway.emitSubscriptionMessage(
            userId.toString(),
            `Your payment for ${packageId} was successful!`,
          );
        } else {
          console.warn(
            `⚠️ No pending local record found for tracker: ${trackerId}`,
          );
        }
      }

      return { status: "success" };
    } catch (err) {
      console.error("🔥 Webhook processing error:", err.message);
      return { status: "error" };
    }
  }
  @UseGuards(JwtAuthGuard)
  @Get("history")
  async getHistory(@Req() req: any) {
    // 🔍 1. Log the object properly to see the keys (id vs userId)
    console.log("📊 User object from JWT:", JSON.stringify(req.user));

    // 2. Extract ID (Check both common patterns)
    const userId = req.user?.userId || req.user?.id || req.user?._id;

    if (!userId) {
      throw new BadRequestException("User ID not found in token payload");
    }

    const history = await this.paymentService.getUserTransactionHistory(userId);

    return history.map((tx) => ({
      id: tx._id,
      tracker: tx.tracker,
      amount: tx.amount,
      package: tx.packageId,
      status: tx.status,
      method: tx.paymentMethod || "Processing",
      date: tx.createdAt,
    }));
  }
}
