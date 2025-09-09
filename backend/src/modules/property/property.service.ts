import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { CreatePropertyDto } from "./dto/create-property.dto";
import { CloudinaryService } from "src/services/Cloudinary Service/cloudinary.service";
import { Property } from "./property.schema";

@Injectable()
export class PropertyService {
  constructor(
    @InjectModel(Property.name) private propertyModel: Model<Property>,
    private readonly cloudinary: CloudinaryService
  ) {}

  async create(
    dto: CreatePropertyDto,
    files: Express.Multer.File[],
    userId: string
  ) {
    let imageUrls: string[] = [];

    if (files && files.length > 0) {
      imageUrls = await Promise.all(
        files.map(async (file) => {
          const uploaded = await this.cloudinary.uploadFile(file);
          return uploaded.secure_url;
        })
      );
    }

    const property = new this.propertyModel({
      ...dto,
      images: imageUrls,
      ownerId: new Types.ObjectId(userId),
    });

    return property.save();
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.propertyModel
        .find()
        .skip(skip)
        .limit(limit)
        .populate("ownerId", "name email"),
      this.propertyModel.countDocuments(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findMyProperties(userId: string) {
    return this.propertyModel
      .find({
        ownerId: new Types.ObjectId(userId),
      })
      .exec();
  }
  async findPropertyById(propertyId: string) {
    return this.propertyModel.findById(new Types.ObjectId(propertyId)).exec();
  }
  async updateProperty(
    id: string,
    dto: Partial<CreatePropertyDto>,
    userId: string
  ) {
    const property = await this.propertyModel.findById(id);

    if (!property) {
      throw new NotFoundException("Property not found");
    }

    if (property.ownerId.toString() !== userId.toString()) {
      throw new UnauthorizedException(
        "You are not allowed to edit this property"
      );
    }

    Object.assign(property, dto);
    return property.save();
  }
  async findPropertyByIdAndDelete(propertyId: string) {
    return this.propertyModel
      .findByIdAndDelete(new Types.ObjectId(propertyId))
      .exec();
  }
  async findFiltered(
    page: number = 1,
    limit: number = 10,
    city?: string,
    minRent?: number,
    maxRent?: number,
    bedrooms?: number,
    propertyType?: string
  ) {
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (city) {
      filter.city = { $regex: city, $options: "i" };
    }

    if (minRent || maxRent) {
      filter.rentPrice = {};
      if (minRent) filter.rentPrice.$gte = minRent;
      if (maxRent) filter.rentPrice.$lte = maxRent;
    }

    if (bedrooms) {
      filter.bedrooms = bedrooms;
    }

    if (propertyType) {
      filter.propertyType = propertyType;
    }

    const [data, total] = await Promise.all([
      this.propertyModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .populate("ownerId", "name email"),
      this.propertyModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
  async getFilterOptions() {
    const cities = await this.propertyModel.distinct("city");

    // Filter out null bedrooms
    const bedrooms = (await this.propertyModel.distinct("bedrooms")).filter(
      (b) => b !== null && b !== undefined
    );

    const rents = await this.propertyModel.aggregate([
      {
        $group: {
          _id: null,
          min: { $min: "$rentPrice" },
          max: { $max: "$rentPrice" },
        },
      },
    ]);

    return {
      cities,
      bedrooms,
      rentRange: rents[0] || { min: 0, max: 0 },
    };
  }
}
