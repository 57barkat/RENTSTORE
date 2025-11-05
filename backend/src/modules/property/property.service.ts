import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { CreatePropertyDto, PropertyWithFav } from "./dto/create-property.dto";
import { Property } from "./property.schema";
import { AddToFavService } from "../addToFav/favorites.service";
import { CloudinaryService } from "src/services/Cloudinary Service/cloudinary.service";

@Injectable()
export class PropertyService {
  constructor(
    @InjectModel(Property.name) private propertyModel: Model<Property>,
    private readonly cloudinary: CloudinaryService,
    private readonly favService: AddToFavService
  ) {}

  // helper for uploading files
  async uploadFilesToCloudinary(
    files: Express.Multer.File[] = []
  ): Promise<string[]> {
    if (!files || files.length === 0) return [];
    const urls = await Promise.all(
      files.map(async (file) => {
        const uploaded = await this.cloudinary.uploadFile(file);
        return uploaded.secure_url;
      })
    );
    return urls;
  }

  // parse nested fields sent as JSON strings (safe)
  private parseNestedFields(dto: any) {
    const parsed: any = { ...dto };
    const toTryParse = [
      "location",
      "capacity",
      "description",
      "safetyDetailsData",
      "amenities",
      "billsIncluded",
      "rules",
      "photos",
    ];

    toTryParse.forEach((k) => {
      const val = parsed[k];
      if (typeof val === "string") {
        try {
          parsed[k] = JSON.parse(val);
        } catch {
          // if parse fails, leave as original string
          // but this indicates a frontend issue — optional to throw
        }
      }
    });

    return parsed;
  }

  private determineCompleteness(parsedDto: any): boolean {
    const baseRequired = ["title", "location", "rentRates"];

    const typeRequirements: Record<string, string[]> = {
      house: ["title", "location", "rentRates"],
      apartment: ["title", "location", "rentRates", "capacity"],
      room: ["title", "location", "rentRates", "subType"],
      hostel: ["title", "location", "rentRates", "capacity", "subType"],
    };

    const required = Array.from(
      new Set([
        ...(typeRequirements[parsedDto.propertyType] || []),
        ...baseRequired,
      ])
    );

    return required.every((f) => {
      const v = parsedDto[f];
      if (f === "rentRates") return Array.isArray(v) && v.length > 0;
      return (
        v !== undefined &&
        v !== null &&
        !(typeof v === "string" && v.trim() === "")
      );
    });
  }

  // create or update entry
  async createOrUpdate(
    dto: CreatePropertyDto,
    imageFiles: Express.Multer.File[] = [],
    userId: string
  ): Promise<Property> {
    // Upload files if present
    const uploadedPhotoUrls = await this.uploadFilesToCloudinary(imageFiles);

    // parse nested fields safely
    const parsedDto: any = this.parseNestedFields(dto);
    // if photos were uploaded, override/append as appropriate
    if (uploadedPhotoUrls.length) {
      parsedDto.photos = uploadedPhotoUrls;
    } else if (!parsedDto.photos) {
      parsedDto.photos = dto.photos || [];
    }

    // ensure keys align with schema: propertyType, rentAmount, securityDeposit, location, capacity
    // determine completeness
    parsedDto.status = !!parsedDto.status
      ? true
      : this.determineCompleteness(parsedDto);

    // Update existing
    if (parsedDto._id) {
      const property = await this.propertyModel.findById(parsedDto._id);
      if (!property) throw new NotFoundException("Property not found");

      if (property.ownerId.toString() !== userId.toString())
        throw new UnauthorizedException(
          "You are not allowed to edit this property"
        );

      // merge: keep existing photos if none uploaded
      if (
        !uploadedPhotoUrls.length &&
        parsedDto.photos &&
        parsedDto.photos.length === 0
      ) {
        // do nothing — allow clearing photos if frontend intentionally sends empty array
      }

      Object.assign(property, parsedDto);
      property.status = parsedDto.status;
      return await property.save();
    }

    // Create new
    const newProp = new this.propertyModel({
      ...parsedDto,
      ownerId: userId,
    });

    return await newProp.save();
  }

  // drafts for a user
  async getAllDrafts(userId: string) {
    const drafts = await this.propertyModel
      .find({ ownerId: new Types.ObjectId(userId), status: false })
      .sort({ createdAt: -1 })
      .lean();
    return drafts;
  }

  async findAll(page = 1, limit = 10, ownerId?: string) {
    const filter: any = { status: true };
    if (ownerId) filter.ownerId = ownerId;
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
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }
  async findFiltered(
    page: number,
    limit: number,
    filters: Record<string, any>,
    userId: string,
    rentFilter?: {
      rentType?: "daily" | "weekly" | "monthly";
      minAmount?: number;
      maxAmount?: number;
    }
  ) {
    const skip = (page - 1) * limit;
    const filter: any = { status: true };

    // --- Location / Title Filters ---
    if (filters.city)
      filter["location.city"] = { $regex: filters.city, $options: "i" };
    if (filters.country)
      filter["location.country"] = { $regex: filters.country, $options: "i" };
    if (filters.stateTerritory)
      filter["location.stateTerritory"] = {
        $regex: filters.stateTerritory,
        $options: "i",
      };
    if (filters.title) filter.title = { $regex: filters.title, $options: "i" };

    // --- Rent Filter using rentFilter param ---
    if (
      rentFilter?.minAmount !== undefined ||
      rentFilter?.maxAmount !== undefined ||
      rentFilter?.rentType
    ) {
      filter.rentRates = {
        $elemMatch: {
          type: rentFilter?.rentType ?? "monthly",
          amount: {
            $gte: rentFilter?.minAmount ?? 0,
            $lte: rentFilter?.maxAmount ?? Number.MAX_SAFE_INTEGER,
          },
        },
      };
    }

    // --- Security Deposit Filter ---
    if (
      filters.minSecurity !== undefined ||
      filters.maxSecurity !== undefined
    ) {
      filter.securityDeposit = {};
      if (filters.minSecurity !== undefined)
        filter.securityDeposit.$gte = filters.minSecurity;
      if (filters.maxSecurity !== undefined)
        filter.securityDeposit.$lte = filters.maxSecurity;
    }

    // --- Capacity Filters ---
    if (filters.bedrooms !== undefined)
      filter["capacity.bedrooms"] = filters.bedrooms;
    if (filters.beds !== undefined) filter["capacity.beds"] = filters.beds;
    if (filters.bathrooms !== undefined)
      filter["capacity.bathrooms"] = filters.bathrooms;
    if (filters.persons !== undefined)
      filter["capacity.persons"] = filters.persons;

    // --- Amenities / Bills / Safety / Highlights ---
    if (filters.amenities?.length)
      filter.amenities = { $all: filters.amenities };
    if (filters.bills?.length) filter.billsIncluded = { $all: filters.bills };
    if (filters.highlighted?.length)
      filter["description.highlights"] = { $all: filters.highlighted };
    if (filters.safety?.length)
      filter["safetyDetailsData.safetyDetails"] = { $all: filters.safety };

    // --- Property Type ---
    if (filters.propertyType) filter.propertyType = filters.propertyType;

    // --- Fetch Data ---
    const [data, total] = await Promise.all([
      this.propertyModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .populate("ownerId", "name email")
        .lean() as unknown as PropertyWithFav[],
      this.propertyModel.countDocuments(filter),
    ]);

    // --- Mark Favorites ---
    if (userId) {
      const favIds = await this.favService.getUserFavoriteIds(userId);
      data.forEach((p) => (p.isFav = favIds.includes(p._id.toString())));
    }

    return {
      data: data || [],
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findMyProperties(userId: string) {
    const data = (await this.propertyModel
      .find({ ownerId: new Types.ObjectId(userId) })
      .populate("ownerId", "name email")
      .lean()) as unknown as PropertyWithFav[];

    const favIds = await this.favService.getUserFavoriteIds(userId);

    return data
      .filter((p) => p.status !== false)
      .map((p) => ({ ...p, isFav: favIds.includes(p._id.toString()) }));
  }

  async findPropertyById(propertyId: string, userId?: string) {
    const property = (await this.propertyModel
      .findByIdAndUpdate(propertyId, { $inc: { views: 1 } }, { new: true })
      .populate("ownerId", "name email phone")
      .lean()) as unknown as PropertyWithFav;

    if (!property) throw new NotFoundException("Property not found");

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
    if (!property) throw new NotFoundException("Property not found");
    if (property.ownerId.toString() !== userId.toString())
      throw new UnauthorizedException(
        "You are not allowed to edit this property"
      );

    const parsed = this.parseNestedFields(dto);
    Object.assign(property, parsed);

    property.status = this.determineCompleteness(property);
    return property.save();
  }

  async findPropertyByIdAndDelete(propertyId: string) {
    return this.propertyModel
      .findByIdAndDelete(new Types.ObjectId(propertyId))
      .exec();
  }
}
