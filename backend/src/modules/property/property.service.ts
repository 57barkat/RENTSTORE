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
    userId: string
  ): Promise<Property> {
    const photoUrls: string[] =
      imageFiles?.length > 0
        ? await Promise.all(
            imageFiles.map(async (file) => {
              const uploaded = await this.cloudinary.uploadFile(file);
              return uploaded.secure_url;
            })
          )
        : [];
    console.log("Create property instance", imageFiles);
    // Create property instance
    const property = new this.propertyModel({
      ...dto,
      photos: photoUrls,
      ownerId: new Types.ObjectId(userId),
    });
    let a;
    try {
      a = await property.save();
      console.log("THE ORIGINAL SAVED DOCUMENT");
    } catch (error) {
      console.log("ERROR DOCUMENT", error);
    }
    return a;
  }

  async findAll(page = 1, limit = 10, ownerId?: string) {
    const filter: any = {};
    if (ownerId) {
      filter.ownerId = ownerId;
    }

    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      this.propertyModel.find(filter).skip(skip).limit(limit).exec(),
      this.propertyModel.countDocuments(filter).exec(),
    ]);

    return {
      data: properties,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

 async findFiltered(
    page = 1,
    limit = 10,
    filters: {
      city?: string;
      country?: string;
      stateTerritory?: string;
      minRent?: number;
      maxRent?: number;
      minSecurity?: number;
      maxSecurity?: number;
      bedrooms?: number;
      beds?: number; //  
      bathrooms?: number;
      guests?: number;
      amenities?: string[];
      bills?: string[];
      hostOption?: string;
      title?: string;
      highlighted?: string[];
      safety?: string[];
    },
    userId?: string
  ) {
    const skip = (page - 1) * limit;
    const filter: any = {};

    if (filters.city)
      filter["address.city"] = { $regex: filters.city, $options: "i" };
    if (filters.country)
      filter["address.country"] = { $regex: filters.country, $options: "i" };
    if (filters.stateTerritory)
      filter["address.stateTerritory"] = {
        $regex: filters.stateTerritory,
        $options: "i",
      };
    if (filters.title) filter.title = { $regex: filters.title, $options: "i" };

    if (filters.minRent !== undefined || filters.maxRent !== undefined) {
      filter.monthlyRent = {};
      if (filters.minRent !== undefined)
        filter.monthlyRent.$gte = filters.minRent;
      if (filters.maxRent !== undefined)
        filter.monthlyRent.$lte = filters.maxRent;
    }

    if (
      filters.minSecurity !== undefined ||
      filters.maxSecurity !== undefined
    ) {
      filter.SecuritybasePrice = {};
      if (filters.minSecurity !== undefined)
        filter.SecuritybasePrice.$gte = filters.minSecurity;
      if (filters.maxSecurity !== undefined)
        filter.SecuritybasePrice.$lte = filters.maxSecurity;
    }

    // Existing: Filters by the number of private bedrooms (rooms)
    if (filters.bedrooms !== undefined)
      filter["capacityState.bedrooms"] = filters.bedrooms;
      
    // MODIFIED: Filters by the total number of beds (sleeping spots)
    if (filters.beds !== undefined) 
      filter["capacityState.beds"] = filters.beds; 
      
    if (filters.bathrooms !== undefined)
      filter["capacityState.bathrooms"] = filters.bathrooms;
    if (filters.guests !== undefined)
      filter["capacityState.guests"] = filters.guests;

    if (filters.amenities?.length)
      filter.amenities = { $all: filters.amenities };
    if (filters.bills?.length) filter.ALL_BILLS = { $all: filters.bills };
    if (filters.highlighted?.length)
      filter["description.highlighted"] = { $all: filters.highlighted };
    if (filters.safety?.length)
      filter["safetyDetailsData.safetyDetails"] = { $all: filters.safety };

    if (filters.hostOption) filter.hostOption = filters.hostOption;

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
