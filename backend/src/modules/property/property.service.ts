import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { CreatePropertyDto, PropertyWithFav } from "./dto/create-property.dto";
import { CloudinaryService } from "src/services/Cloudinary Service/cloudinary.service";
import { Property } from "./property.schema";
import { AddToFavService } from "../addToFav/favorites.service";

@Injectable()
export class PropertyService {
  constructor(
    @InjectModel(Property.name) private propertyModel: Model<Property>,
    private readonly cloudinary: CloudinaryService,
    private readonly favService: AddToFavService
  ) {}

  async create(
    dto: CreatePropertyDto,
    imageFiles: Express.Multer.File[],
    videoFiles: Express.Multer.File[],
    userId: string
  ) {
    let imageUrls: string[] = [];
    let videoUrls: string[] = [];

    if (imageFiles && imageFiles.length > 0) {
      imageUrls = await Promise.all(
        imageFiles.map(async (file) => {
          const uploaded = await this.cloudinary.uploadFile(file);
          return uploaded.secure_url;
        })
      );
    }

    if (videoFiles && videoFiles.length > 0) {
      videoUrls = await Promise.all(
        videoFiles.map(async (file) => {
          const uploaded = await this.cloudinary.uploadFile(file);
          return uploaded.secure_url;
        })
      );
    }

    const property = new this.propertyModel({
      ...dto,
      images: imageUrls,
      videos: videoUrls,
      ownerId: new Types.ObjectId(userId),
    });
    return property.save();
  }

  async findAll(page: number = 1, limit: number = 10, userId?: string) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.propertyModel
        .find()
        .skip(skip)
        .limit(limit)
        .populate("ownerId", "name email")
        .lean() as unknown as PropertyWithFav[],
      this.propertyModel.countDocuments(),
    ]);

    if (userId) {
      const favIds = await this.favService.getUserFavoriteIds(userId);
      data.forEach((p) => (p.isFav = favIds.includes(p._id.toString())));
    }

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findFiltered(
    page: number = 1,
    limit: number = 10,
    city?: string,
    minRent?: number,
    maxRent?: number,
    bedrooms?: number,
    propertyType?: string,
    userId?: string
  ) {
    const skip = (page - 1) * limit;
    const filter: any = {};

    if (city) filter.city = { $regex: city, $options: "i" };
    if (minRent !== undefined || maxRent !== undefined) {
      filter.rentPrice = {};
      if (minRent !== undefined) filter.rentPrice.$gte = minRent;
      if (maxRent !== undefined) filter.rentPrice.$lte = maxRent;
    }
    if (bedrooms !== undefined) filter.bedrooms = bedrooms;
    if (propertyType) filter.propertyType = propertyType;

    try {
      const [data, total] = await Promise.all([
        this.propertyModel
          .find(filter)
          .skip(skip)
          .limit(limit)
          .populate("ownerId", "name email")
          .lean() as unknown as PropertyWithFav[],
        this.propertyModel.countDocuments(filter),
      ]);

      if (userId) {
        const favIds = await this.favService.getUserFavoriteIds(userId);
        data.forEach((p) => (p.isFav = favIds.includes(p._id.toString())));
      }

      return {
        data: data || [],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    } catch (err) {
      console.error("Error in findFiltered:", err);
      throw new Error("Internal server error");
    }
  }

  async findMyProperties(userId: string) {
    const data = (await this.propertyModel
      .find({ ownerId: new Types.ObjectId(userId) })
      .populate("ownerId", "name email")
      .lean()) as unknown as PropertyWithFav[];

    const favIds = await this.favService.getUserFavoriteIds(userId);
    data.forEach((p) => (p.isFav = favIds.includes(p._id.toString())));

    return data;
  }

  async findPropertyById(propertyId: string, userId?: string) {
    const property = (await this.propertyModel
      .findByIdAndUpdate(propertyId, { $inc: { views: 1 } }, { new: true })
      .populate("ownerId", "name email phone")
      .lean()) as unknown as PropertyWithFav;

    if (!property) {
      throw new NotFoundException("Property not found");
    }

    if (userId) {
      const favIds = await this.favService.getUserFavoriteIds(userId);
      property.isFav = favIds.includes(property._id.toString());
    } else {
      property.isFav = false;
    }

    return property;
  }

  async getFeaturedProperties(userId?: string) {
    const data = (await this.propertyModel
      .find()
      .sort({ views: -1 })
      .limit(5)
      .populate("ownerId", "name email")
      .lean()) as unknown as PropertyWithFav[];

    if (userId) {
      const favIds = await this.favService.getUserFavoriteIds(userId);
      data.forEach((p) => (p.isFav = favIds.includes(p._id.toString())));
    }

    return data;
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

  async getFilterOptions() {
    const cities = await this.propertyModel.distinct("city");
    const bedrooms = await this.propertyModel.distinct("bedrooms");
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
