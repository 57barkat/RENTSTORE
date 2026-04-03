import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import axios from "axios";
import { Model, Types } from "mongoose";
import { Payment } from "./payment.schema";

const SafepaySDK = require("@sfpy/node-sdk");

@Injectable()
export class PaymentService {
  private safepay: any;

  constructor(
    @InjectModel(Payment.name) private readonly paymentModel: Model<Payment>,
  ) {
    const apiKey = process.env.SAFEPAY_API_KEY;
    const secretKey = process.env.SAFEPAY_SECRET_KEY;
    const webhookSecret = process.env.SAFEPAY_WEBHOOK_SECRET;

    if (!apiKey || !secretKey || !webhookSecret) {
      throw new Error("Missing Safepay keys in process.env");
    }

    const Safepay = SafepaySDK.Safepay;
    this.safepay = new Safepay({
      environment: "sandbox",
      apiKey,
      v1Secret: secretKey,
      webhookSecret,
    });
    console.log("✅ Safepay SDK Ready & Database Connected");
  }

  async createCheckout(userId: string, packageId: string) {
    const prices: Record<string, number> = {
      single: 300,
      standard: 1200,
      business_pro: 5500,
    };

    const amount = prices[packageId];
    if (!amount) throw new BadRequestException("Invalid package selected");

    try {
      const session = await this.safepay.payments.create({
        amount: amount,
        currency: "PKR",
      });

      await this.paymentModel.create({
        userId: new Types.ObjectId(userId),
        tracker: session.token,
        packageId: packageId,
        amount: amount,
        status: "pending",
        currency: "PKR",
      });

      const auth = await this.safepay.authorization.create();
      const ngrokUrl = "https://banefully-jointed-freya.ngrok-free.dev";

      const checkoutUrl =
        `https://sandbox.api.getsafepay.com/checkout/pay?beacon=${session.token}` +
        `&tbt=${auth}` +
        `&env=sandbox` +
        `&source=mobile` +
        `&return_url=${encodeURIComponent(`${ngrokUrl}/api/v1/payments/payment-success`)}` +
        `&cancel_url=${encodeURIComponent(`${ngrokUrl}/api/v1/payments/payment-cancel`)}`;

      return {
        url: checkoutUrl,
        tracker: session.token,
      };
    } catch (err: any) {
      console.error("❌ Checkout creation failed:", err.message);
      throw new InternalServerErrorException("Checkout creation failed");
    }
  }

  async getInternalPaymentByTracker(tracker: string) {
    return await this.paymentModel.findOne({ tracker }).exec();
  }

  async markInternalPaymentAsCompleted(tracker: string, rawBody?: any) {
    const notification = rawBody?.data?.notification;
    const intent = notification?.intent;

    const methodMap: Record<string, string> = {
      CYBERSOURCE: "Card",
      "DIRECT-BANK-TRANSFER": "Mobile Wallet/Bank",
      "SANDBOX-PAYMENT": "Sandbox Test",
    };

    const displayMethod = methodMap[intent] || intent || "Unknown";

    console.log(
      `🏷️  Mapped Intent: ${intent} to Display Name: ${displayMethod}`,
    );

    return await this.paymentModel
      .findOneAndUpdate(
        { tracker },
        {
          status: "completed",
          paymentMethod: displayMethod,
          rawResponse: rawBody,
        },
        { new: true },
      )
      .exec();
  }

  async getUserTransactionHistory(userId: string) {
    try {
      return await this.paymentModel
        .find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .limit(20)
        .exec();
    } catch (err: any) {
      console.error("❌ Error fetching history:", err.message);
      throw new InternalServerErrorException(
        "Could not retrieve transaction history",
      );
    }
  }

  // Verification method for manual checks if needed
  async verifyPayment(tracker: string) {
    try {
      const isSandbox = process.env.NODE_ENV !== "production";
      const baseUrl = isSandbox
        ? "https://sandbox.api.getsafepay.com"
        : "https://api.getsafepay.com";

      const response = await axios.get(
        `${baseUrl}/order/v1/tracker/${tracker}`,
      );
      return response.data;
    } catch (err: any) {
      console.error(
        "❌ direct verifyPayment Error:",
        err.response?.data || err.message,
      );
      return null;
    }
  }
}
