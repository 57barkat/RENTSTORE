import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, Types } from "mongoose";

import { CreatePropertyDto, PropertyWithFav } from "./dto/create-property.dto";
import { CloudinaryService } from "../../services/Cloudinary Service/cloudinary.service";
import { Property } from "./property.schema";
import { AddToFavService } from "../addToFav/favorites.service";
import { DeletedImagesService } from "../../deletedImages/deletedImages.service";
import { PropertyFilters } from "./utils/property-filter.util";

@Injectable()
export class PropertyService {
  constructor(
    @InjectModel(Property.name) private propertyModel: Model<Property>,
    @InjectModel("PropertyDraft") private propertyDraftModel: Model<any>,
    public readonly cloudinary: CloudinaryService,
    private readonly favService: AddToFavService,
    private readonly deletedImagesService: DeletedImagesService,
  ) {}

  async uploadFilesToCloudinary(
    files: Express.Multer.File[],
  ): Promise<string[]> {
    if (!files || files.length === 0) return [];
    const urls = await Promise.all(
      files.map(async (file) => {
        const uploaded = await this.cloudinary.uploadFile(file);
        return uploaded.secure_url;
      }),
    );
    return urls;
  }

  // ---------------------- Service ----------------------
  async createOrUpdate(
    dto: CreatePropertyDto,
    userId: string,
  ): Promise<Property> {
    let property: Property | null = null;
    const propertyId = dto._id;

    if (propertyId) {
      property = await this.propertyModel.findById(propertyId);

      if (property) {
        if (property.ownerId.toString() !== userId.toString())
          throw new UnauthorizedException("Not allowed to edit this property");

        const oldPhotos = property.photos || [];
        const newPhotos = dto.photos || [];
        const photosToDelete = oldPhotos.filter(
          (url) => !newPhotos.includes(url),
        );

        if (photosToDelete.length > 0) {
          await this.deletedImagesService.addDeletedImages(
            photosToDelete,
            userId,
            "property",
          );
        }

        // Update GeoJSON if lat/lng provided
        if (dto.lat !== undefined && dto.lng !== undefined) {
          dto.locationGeo = {
            type: "Point",
            coordinates: [dto.lng, dto.lat],
          };
        }

        Object.assign(property, dto);
        return await property.save();
      }

      const draft = await this.propertyDraftModel.findById(propertyId);
      if (draft) {
        if (draft.ownerId.toString() !== userId.toString())
          throw new UnauthorizedException("Not allowed to promote this draft");

        const { _id, ...draftData } = draft.toObject();
        if (dto.lat !== undefined && dto.lng !== undefined) {
          dto.locationGeo = {
            type: "Point",
            coordinates: [dto.lng, dto.lat],
          };
        }

        property = new this.propertyModel({
          ...draftData,
          ...dto,
          ownerId: userId,
          status: true,
        });

        const savedProperty = await property.save();
        await this.propertyDraftModel.findByIdAndDelete(propertyId);

        return savedProperty;
      }

      throw new NotFoundException(
        "Property or Draft not found with provided ID",
      );
    }

    // NO ID: New property
    if (dto.lat !== undefined && dto.lng !== undefined) {
      dto.locationGeo = { type: "Point", coordinates: [dto.lng, dto.lat] };
    }

    property = new this.propertyModel({
      ...dto,
      ownerId: userId,
      status: true,
    });
    return await property.save();
  }
  async findNearbyProperties(
    lat: number,
    lng: number,
    radiusKm: number,
    userId?: string,
  ) {
    const mongoFilter: FilterQuery<Property> = { status: true };

    // Exclude user's own listings if userId provided
    if (userId) {
      mongoFilter.ownerId = { $ne: new Types.ObjectId(userId) };
    }

    // GeoJSON $near filter
    mongoFilter.locationGeo = {
      $near: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: radiusKm * 1000, // meters
      },
    };

    // Fetch top 20 nearby properties
    const data = await this.propertyModel
      .find(mongoFilter)
      .limit(20)
      .populate("ownerId", "name email")
      .lean();

    return {
      data,
      total: data.length,
      message: data.length
        ? `Found ${data.length} nearby properties within ${radiusKm} km`
        : "No nearby properties found",
    };
  }

  async saveDraft(
    dto: Partial<CreatePropertyDto>,
    imageFiles?: Express.Multer.File[],
    userId?: string,
  ) {
    const photos: string[] = imageFiles?.length
      ? await this.uploadFilesToCloudinary(imageFiles)
      : dto.photos || [];

    if (dto.lat !== undefined && dto.lng !== undefined) {
      dto.locationGeo = { type: "Point", coordinates: [dto.lng, dto.lat] };
    }

    const filter = dto._id ? { _id: dto._id } : { _id: new Types.ObjectId() };
    const update = {
      ...dto,
      photos,
      ownerId: new Types.ObjectId(userId),
      status: false,
    };

    return this.propertyDraftModel.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true,
    });
  }

  async getAllDrafts(userId: string | Types.ObjectId) {
    const ownerObjectId =
      typeof userId === "string" ? new Types.ObjectId(userId) : userId;

    const drafts = await this.propertyDraftModel
      .find({ ownerId: ownerObjectId, status: false })
      .sort({ createdAt: -1 })
      .lean();
    return drafts;
  }

  async findAll(page = 1, limit = 10, ownerId?: string) {
    const filter: any = { status: true };
    if (ownerId) filter.ownerId = ownerId;

    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      this.propertyModel
        .find(filter)
        .sort({ featured: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
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
    filters: PropertyFilters & {
      sortBy?: string;
      lat?: number;
      lng?: number;
      radiusKm?: number;
      area?: string;
    },
    userId?: string,
  ): Promise<any> {
    const {
      city,
      addressQuery,
      minRent,
      maxRent,
      bedrooms,
      bathrooms,
      floorLevel,
      hostOption,
      sortBy,
      lat,
      lng,
      radiusKm,
      area,
    } = filters;

    const mongoFilter: any = { status: true };
    if (userId) mongoFilter.ownerId = { $ne: new Types.ObjectId(userId) };

    const andConditions: any[] = [];

    // 1️⃣ SMART SEARCH LOGIC
    const searchInput = addressQuery || area;

    if (searchInput) {
      const cleanedQuery = searchInput.trim();

      // Create a regex that treats dashes, slashes, and spaces as optional/interchangeable
      // Example: "I10-1" -> "I[-/\s]?1[-/\s]?0[-/\s]?1"
      const flexiblePattern = cleanedQuery
        .replace(/[-/\s]/g, "") // Remove existing separators
        .split("")
        .join("[-/\\s]?");

      const searchRegex = { $regex: flexiblePattern, $options: "i" };

      // DETECT SPECIFICITY: Does the query look like a sub-sector? (e.g., "I10/1" or "I10-1")
      // If it has a sub-sector indicator, we ONLY search location/title/street.
      // If it's just "I10", we can include the general "area" field.
      const isSpecific =
        /\d[-/\s]\d/.test(cleanedQuery) ||
        (cleanedQuery.length > 3 && /[0-9]$/.test(cleanedQuery));

      if (isSpecific) {
        andConditions.push({
          $or: [
            { location: searchRegex },
            { title: searchRegex },
            { "address.street": searchRegex },
          ],
        });
      } else {
        andConditions.push({
          $or: [
            { area: searchRegex },
            { location: searchRegex },
            { title: searchRegex },
          ],
        });
      }
    }

    // 2️⃣ City Filter
    if (city) {
      // Matches city inside the address array of objects
      andConditions.push({
        "address.city": { $regex: city, $options: "i" },
      });
    }

    // 3️⃣ Rental Price Filter
    if (minRent !== undefined || maxRent !== undefined) {
      mongoFilter.monthlyRent = {};
      if (minRent !== undefined) mongoFilter.monthlyRent.$gte = Number(minRent);
      if (maxRent !== undefined) mongoFilter.monthlyRent.$lte = Number(maxRent);
    }

    // 4️⃣ Capacity & Host Options
    if (hostOption)
      mongoFilter.hostOption = { $regex: hostOption, $options: "i" };
    if (bedrooms !== undefined)
      mongoFilter["capacityState.bedrooms"] = Number(bedrooms);
    if (bathrooms !== undefined)
      mongoFilter["capacityState.bathrooms"] = Number(bathrooms);
    if (floorLevel !== undefined)
      mongoFilter["capacityState.floorLevel"] = Number(floorLevel);

    // 5️⃣ Apply AND conditions to the main filter
    if (andConditions.length > 0) mongoFilter.$and = andConditions;

    // 6️⃣ Geospatial Logic
    if (lat !== undefined && lng !== undefined && radiusKm !== undefined) {
      mongoFilter.locationGeo = {
        $near: {
          $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
          $maxDistance: Number(radiusKm) * 1000,
        },
      };
    }

    // 7️⃣ Sorting Logic
    let sortQuery: any = { featured: -1, _id: -1 };
    if (sortBy === "price_asc") sortQuery = { monthlyRent: 1, _id: -1 };
    else if (sortBy === "price_desc") sortQuery = { monthlyRent: -1, _id: -1 };
    else if (sortBy === "newest") sortQuery = { createdAt: -1, _id: -1 };

    const total = await this.propertyModel.countDocuments(mongoFilter);
    const data = await this.propertyModel
      .find(mongoFilter)
      .sort(sortQuery)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate("ownerId", "name email phone profileImage")
      .lean();

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
      message:
        data.length > 0
          ? "Properties fetched successfully."
          : "No properties match your search.",
    };
  }
  async getAddressSuggestions(query: string, limit = 5) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const cleaned = query.trim();

    // Flexible regex like your smart search
    const flexiblePattern = cleaned
      .replace(/[-/\s]/g, "")
      .split("")
      .join("[-/\\s]?");

    const regex = new RegExp(flexiblePattern, "i");

    const results = await this.propertyModel.aggregate([
      {
        $match: {
          status: true,
          $or: [
            { location: regex },
            { title: regex },
            { "address.street": regex },
            { area: regex },
          ],
        },
      },
      {
        $project: {
          suggestion: {
            $ifNull: ["$location", "$title"],
          },
        },
      },
      { $group: { _id: "$suggestion" } },
      { $limit: limit },
    ]);

    return results.map((r) => r._id);
  }

  async findMyProperties(
    userId: string,
    page = 1,
    limit = 10,
    sort = "newest",
    search?: string,
    city?: string,
  ) {
    const filter: FilterQuery<any> = {
      ownerId: new Types.ObjectId(userId),
      status: { $ne: false },
    };

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    if (city) {
      filter.city = city;
    }

    // Sorting logic
    let sortOption: any = { createdAt: -1 };

    if (sort === "oldest") sortOption = { createdAt: 1 };
    if (sort === "priceLow") sortOption = { price: 1 };
    if (sort === "priceHigh") sortOption = { price: -1 };

    const skip = (page - 1) * limit;

    const data = await this.propertyModel
      .find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate("ownerId", "name email")
      .lean();

    const total = await this.propertyModel.countDocuments(filter);

    const favIds = await this.favService.getUserFavoriteIds(userId);

    const result = data.map((p) => ({
      ...p,
      isFav: favIds.includes(p._id.toString()),
    }));

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: result,
    };
  }

  async findPropertyById(propertyId: string, userId?: string) {
    const objectId = new Types.ObjectId(propertyId);

    const [property] = await this.propertyModel.aggregate([
      { $match: { _id: objectId } },
      {
        $addFields: {
          ownerObjId: { $toObjectId: "$ownerId" },
          views: { $add: [{ $ifNull: ["$views", 0] }, 1] },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "ownerObjId",
          foreignField: "_id",
          as: "owner",
        },
      },
      { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
      { $project: { "owner.password": 0, "owner.refreshToken": 0 } },
    ]);

    if (!property) throw new NotFoundException("Property not found");

    const isOwner =
      userId && property.owner?._id?.toString() === userId.toString();
    property.chat = !isOwner && !!userId;

    await this.propertyModel.updateOne(
      { _id: objectId },
      { $inc: { views: 1 } },
    );

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
    userId: string,
  ) {
    const property = await this.propertyModel.findById(id);
    if (!property) throw new NotFoundException("Property not found");

    if (property.ownerId.toString() !== userId.toString()) {
      throw new UnauthorizedException(
        "You are not allowed to edit this property",
      );
    }

    Object.assign(property, dto);
    if (dto.lat !== undefined && dto.lng !== undefined) {
      property.locationGeo = { type: "Point", coordinates: [dto.lng, dto.lat] };
    }

    const isFilled = (value: any): boolean => {
      if (value === null || value === undefined) return false;
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "object") return Object.keys(value).length > 0;
      if (typeof value === "string") return value.trim() !== "";
      return true;
    };

    const requiredFields = [
      "title",
      "hostOption",
      "location",
      "monthlyRent",
      "SecuritybasePrice",
      "address",
      "capacityState",
    ];

    property.status = requiredFields.every((field) =>
      isFilled(property[field]),
    );

    return property.save();
  }

  async findPropertyByIdAndDelete(propertyId: string, userId: string) {
    const property = await this.propertyModel.findById(propertyId);
    if (!property) throw new NotFoundException("Property not found");

    if (property.photos?.length) {
      await this.deletedImagesService.addDeletedImages(
        property.photos,
        userId,
        "property",
      );
    }

    await this.propertyModel.findByIdAndDelete(propertyId);
    return {
      message: "Property deleted, photos queued for Cloudinary cleanup",
    };
  }

  async deleteDraftById(draftId: string, userId: string) {
    const draft = await this.propertyDraftModel.findById(draftId);
    if (!draft) throw new NotFoundException("Draft not found");

    if (draft.ownerId.toString() !== userId.toString()) {
      throw new UnauthorizedException("Not allowed to delete this draft");
    }

    if (draft.photos?.length) {
      await this.deletedImagesService.addDeletedImages(
        draft.photos,
        userId,
        "draft",
      );
    }

    await this.propertyDraftModel.findByIdAndDelete(draftId);
    return { message: "Draft deleted, photos queued for Cloudinary cleanup" };
  }
}
