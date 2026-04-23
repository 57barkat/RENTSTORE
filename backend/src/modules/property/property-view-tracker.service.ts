import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Property } from "./property.schema";

@Injectable()
export class PropertyViewTrackerService {
  private readonly logger = new Logger(PropertyViewTrackerService.name);

  constructor(
    @InjectModel(Property.name) private readonly propertyModel: Model<Property>,
  ) {}

  async queueView(propertyId: string) {
    try {
      await this.propertyModel.updateOne(
        { _id: new Types.ObjectId(propertyId) },
        { $inc: { views: 1 } },
      );
    } catch (error) {
      this.logger.warn(`Failed to increment property view: ${String(error)}`);
    }
  }
}
