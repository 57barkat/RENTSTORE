import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  SubscriptionType,
  User,
  UserDocument,
} from "src/modules/user/user.entity";
import { Property, PropertyDocument } from "../property.schema";
import { PaymentSocketGateway } from "src/services/payment/payment-socket.gateway";

@Injectable()
export class SubscriptionCleanupService {
  private readonly logger = new Logger(SubscriptionCleanupService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Property.name) private propertyModel: Model<PropertyDocument>,
    private readonly paymentGateway: PaymentSocketGateway,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyCleanup() {
    this.logger.log("Starting Subscription and Property Weight Cleanup...");
    const now = new Date();

    try {
      const expiredUsers = await this.userModel
        .find({
          subscription: { $ne: SubscriptionType.FREE },
          subscriptionEndDate: { $lt: now },
          subscriptionAutoRenew: false,
        })
        .select("_id");

      const expiredUserIds = expiredUsers.map((u) => u.id.toString());

      if (expiredUserIds.length > 0) {
        // Two-stage update for property limit sync
        await this.userModel.updateMany({ _id: { $in: expiredUserIds } }, [
          {
            $set: {
              propertyLimit: {
                $subtract: ["$propertyLimit", "$paidPropertyCredits"],
              },
              subscription: SubscriptionType.FREE,
              prioritySlotCredits: 0,
              paidPropertyCredits: 0,
            },
          },
          {
            $set: {
              usedPropertyCount: "$propertyLimit",
            },
          },
        ]);

        // Remove boosts
        await this.propertyModel.updateMany(
          { ownerId: { $in: expiredUserIds }, isBoosted: true },
          { $set: { isBoosted: false } },
        );

        // --- NEW: Emit Socket Events ---
        expiredUserIds.forEach((id) => {
          this.paymentGateway.emitSubscriptionMessage(
            id,
            "Your subscription has expired. Your account has been downgraded to free tier. Please renew to regain full access.",
          );
        });

        this.logger.log(
          `Downgraded and Notified ${expiredUserIds.length} users via Sockets.`,
        );
      }

      // Cleanup Featured Ads
      await this.propertyModel.updateMany(
        { featured: true, featuredUntil: { $lt: now } },
        {
          $set: {
            featured: false,
            featuredUntil: null,
          },
        },
      );

      // Batch Update Sort Weights
      await Promise.all([
        this.propertyModel.updateMany(
          { featured: true },
          { $set: { sortWeight: 3 } },
        ),
        this.propertyModel.updateMany(
          { featured: false, isBoosted: true },
          { $set: { sortWeight: 2 } },
        ),
        this.propertyModel.updateMany(
          { featured: false, isBoosted: false },
          { $set: { sortWeight: 1 } },
        ),
      ]);

      this.logger.log("Recalculated all property sortWeights.");
    } catch (error) {
      this.logger.error("Error during cleanup cron job", error.stack);
    }
  }
}
