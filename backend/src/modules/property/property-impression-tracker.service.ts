import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Property } from "./property.schema";
import { resolvePromotionWeight } from "./utils/property-promotion.util";

type ImpressionInput = {
  _id?: string | Types.ObjectId;
  sortWeight?: number;
  featured?: boolean;
  featuredUntil?: Date | string | null;
  isBoosted?: boolean;
  boostedUntil?: Date | string | null;
};

@Injectable()
export class PropertyImpressionTrackerService {
  private readonly logger = new Logger(PropertyImpressionTrackerService.name);

  constructor(
    @InjectModel(Property.name) private readonly propertyModel: Model<Property>,
  ) {}

  async queueImpressions(properties: ImpressionInput[]) {
    if (properties.length === 0) {
      return;
    }

    try {
      const counts = new Map<string, Record<string, number>>();

      for (const property of properties) {
        const propertyId = property._id?.toString();
        if (!propertyId || !Types.ObjectId.isValid(propertyId)) {
          continue;
        }

        const current =
          counts.get(propertyId) ||
          {
            impressions: 0,
            featuredImpressions: 0,
            boostedImpressions: 0,
            normalImpressions: 0,
            promotedImpressions: 0,
          };

        const weight = resolvePromotionWeight(property);

        current.impressions += 1;
        if (weight === 3) {
          current.featuredImpressions += 1;
          current.promotedImpressions += 1;
        } else if (weight === 2) {
          current.boostedImpressions += 1;
          current.promotedImpressions += 1;
        } else {
          current.normalImpressions += 1;
        }

        counts.set(propertyId, current);
      }

      if (counts.size === 0) {
        return;
      }

      await this.propertyModel.bulkWrite(
        Array.from(counts.entries()).map(([propertyId, increments]) => ({
          updateOne: {
            filter: { _id: new Types.ObjectId(propertyId) },
            update: { $inc: increments },
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
