import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Interval } from "@nestjs/schedule";
import { Model, Types } from "mongoose";
import { Property } from "./property.schema";

@Injectable()
export class PropertyImpressionTrackerService {
  private readonly logger = new Logger(PropertyImpressionTrackerService.name);
  private readonly pendingImpressions = new Map<string, number>();
  private flushInProgress = false;

  constructor(
    @InjectModel(Property.name) private readonly propertyModel: Model<Property>,
  ) {}

  queueImpressions(propertyIds: string[]) {
    for (const propertyId of propertyIds) {
      const current = this.pendingImpressions.get(propertyId) ?? 0;
      this.pendingImpressions.set(propertyId, current + 1);
    }
  }

  @Interval(5000)
  async flushPendingImpressions() {
    if (this.flushInProgress || this.pendingImpressions.size === 0) {
      return;
    }

    this.flushInProgress = true;
    const batch = Array.from(this.pendingImpressions.entries());
    this.pendingImpressions.clear();

    try {
      await this.propertyModel.bulkWrite(
        batch.map(([propertyId, count]) => ({
          updateOne: {
            filter: { _id: new Types.ObjectId(propertyId) },
            update: { $inc: { impressions: count } },
          },
        })),
        { ordered: false },
      );
    } catch (error) {
      batch.forEach(([propertyId, count]) => {
        const current = this.pendingImpressions.get(propertyId) ?? 0;
        this.pendingImpressions.set(propertyId, current + count);
      });
      this.logger.warn(`Failed to flush property impressions: ${String(error)}`);
    } finally {
      this.flushInProgress = false;
    }
  }
}
