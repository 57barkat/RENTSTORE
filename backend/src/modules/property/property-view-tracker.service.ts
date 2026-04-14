import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Interval } from "@nestjs/schedule";
import { Model, Types } from "mongoose";
import { Property } from "./property.schema";

@Injectable()
export class PropertyViewTrackerService {
  private readonly logger = new Logger(PropertyViewTrackerService.name);
  private readonly pendingViews = new Map<string, number>();
  private flushInProgress = false;

  constructor(
    @InjectModel(Property.name) private readonly propertyModel: Model<Property>,
  ) {}

  queueView(propertyId: string) {
    const current = this.pendingViews.get(propertyId) ?? 0;
    this.pendingViews.set(propertyId, current + 1);
  }

  @Interval(5000)
  async flushPendingViews() {
    if (this.flushInProgress || this.pendingViews.size === 0) {
      return;
    }

    this.flushInProgress = true;
    const batch = Array.from(this.pendingViews.entries());
    this.pendingViews.clear();

    try {
      await this.propertyModel.bulkWrite(
        batch.map(([propertyId, count]) => ({
          updateOne: {
            filter: { _id: new Types.ObjectId(propertyId) },
            update: { $inc: { views: count } },
          },
        })),
        { ordered: false },
      );
    } catch (error) {
      batch.forEach(([propertyId, count]) => {
        const current = this.pendingViews.get(propertyId) ?? 0;
        this.pendingViews.set(propertyId, current + count);
      });
      this.logger.warn(`Failed to flush property views: ${String(error)}`);
    } finally {
      this.flushInProgress = false;
    }
  }
}
