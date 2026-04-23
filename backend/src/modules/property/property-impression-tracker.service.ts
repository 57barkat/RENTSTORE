import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Property } from "./property.schema";

@Injectable()
export class PropertyImpressionTrackerService {
  private readonly logger = new Logger(PropertyImpressionTrackerService.name);

  constructor(
    @InjectModel(Property.name) private readonly propertyModel: Model<Property>,
  ) {}

  async queueImpressions(propertyIds: string[]) {
    if (propertyIds.length === 0) {
      return;
    }

    try {
      const counts = new Map<string, number>();
      for (const propertyId of propertyIds) {
        counts.set(propertyId, (counts.get(propertyId) || 0) + 1);
      }

      await this.propertyModel.bulkWrite(
        Array.from(counts.entries()).map(([propertyId, count]) => ({
          updateOne: {
            filter: { _id: new Types.ObjectId(propertyId) },
            update: { $inc: { impressions: count } },
          },
        })),
        { ordered: false },
      );
    } catch (error) {
      this.logger.warn(
        `Failed to increment property impressions: ${String(error)}`,
      );
    }
  }
}
