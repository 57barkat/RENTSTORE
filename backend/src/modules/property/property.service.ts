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
import { buildMongoFilter } from "./utils/property.utils";
import { User, UserDocument } from "../user/user.entity";
import { PropertyViewTrackerService } from "./property-view-tracker.service";

@Injectable()
export class PropertyService {
  constructor(
    @InjectModel(Property.name) private propertyModel: Model<Property>,
    @InjectModel("PropertyDraft") private propertyDraftModel: Model<any>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    public readonly cloudinary: CloudinaryService,
    private readonly favService: AddToFavService,
    private readonly deletedImagesService: DeletedImagesService,
    private readonly propertyViewTracker: PropertyViewTrackerService,
  ) {}

  async uploadFilesToCloudinary(
    files: Express.Multer.File[],
  ): Promise<string[]> {
    if (!files || files.length === 0) return [];
    return this.mapWithConcurrency(files, 2, async (file) => {
      const uploaded = await this.cloudinary.uploadFile(file);
      return uploaded.secure_url;
    });
  }

  private async mapWithConcurrency<T, R>(
    items: T[],
    concurrency: number,
    mapper: (item: T, index: number) => Promise<R>,
  ): Promise<R[]> {
    const results = new Array<R>(items.length);
    let nextIndex = 0;

    await Promise.all(
      Array.from({ length: Math.min(concurrency, items.length) }, async () => {
        while (nextIndex < items.length) {
          const currentIndex = nextIndex++;
          results[currentIndex] = await mapper(items[currentIndex], currentIndex);
        }
      }),
    );

    return results;
  }

  async createOrUpdate(
    dto: Partial<CreatePropertyDto>,
    userId: string,
  ): Promise<Property> {
    let property: Property | null = null;
    const propertyId = dto._id;

    if (dto.photos) {
      dto.photos = Array.from(new Set(dto.photos));
    }

    // ========================= UPDATE EXISTING =========================
    if (propertyId) {
      property = await this.propertyModel.findById(propertyId);

      if (property) {
        if (property.ownerId.toString() !== userId.toString())
          throw new UnauthorizedException("Not allowed to edit this property");

        const oldPhotos = property.photos || [];
        const newPhotos = dto.photos || [];
        const uniqueNewPhotos = Array.from(new Set(newPhotos));

        const photosToDelete = oldPhotos.filter(
          (url) => !uniqueNewPhotos.includes(url),
        );

        if (photosToDelete.length > 0) {
          await this.deletedImagesService.addDeletedImages(
            photosToDelete,
            userId,
            "property",
          );
        }

        if (dto.lat !== undefined && dto.lng !== undefined) {
          dto.locationGeo = {
            type: "Point",
            coordinates: [dto.lng, dto.lat],
          };
        }

        Object.assign(property, {
          ...dto,
          photos: uniqueNewPhotos,
        });

        return await property.save();
      }

      // ========================= PROMOTE DRAFT =========================
      const draft = await this.propertyDraftModel.findById(propertyId);
      if (draft) {
        if (draft.ownerId.toString() !== userId.toString())
          throw new UnauthorizedException("Not allowed to promote this draft");

        // 🔥 LIMIT CHECK (IMPORTANT)
        const user = await this.userModel.findById(userId);
        if (!user) throw new NotFoundException("User not found");

        let propertyCount = 0;

        if (user.agency) {
          // 👉 Agency shared limit
          const agencyUsers = await this.userModel.find({
            agency: user.agency,
          });

          const agencyUserIds = agencyUsers.map((u) => u._id);

          propertyCount = await this.propertyModel.countDocuments({
            ownerId: { $in: agencyUserIds },
          });
        } else {
          // 👉 Normal user limit
          propertyCount = await this.propertyModel.countDocuments({
            ownerId: userId,
          });
        }

        if (propertyCount >= user.propertyLimit) {
          throw new UnauthorizedException(
            `Property limit reached (${user.propertyLimit})`,
          );
        }

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
          photos: Array.from(new Set(dto.photos || draftData.photos || [])),
          ownerId: userId,
          status: true,
          isApproved: false,
        });

        const savedProperty = await property.save();
        await this.propertyDraftModel.findByIdAndDelete(propertyId);

        return savedProperty;
      }

      throw new NotFoundException(
        "Property or Draft not found with provided ID",
      );
    }

    // ========================= NEW PROPERTY =========================

    // 🔥 LIMIT CHECK (IMPORTANT)
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException("User not found");

    let propertyCount = 0;

    if (user.agency) {
      // 👉 Agency shared limit
      const agencyUsers = await this.userModel.find({
        agency: user.agency,
      });

      const agencyUserIds = agencyUsers.map((u) => u._id);

      propertyCount = await this.propertyModel.countDocuments({
        ownerId: { $in: agencyUserIds },
      });
    } else {
      // 👉 Normal user limit
      propertyCount = await this.propertyModel.countDocuments({
        ownerId: userId,
      });
    }

    if (propertyCount >= user.propertyLimit) {
      throw new UnauthorizedException(
        `Property limit reached (${user.propertyLimit})`,
      );
    }

    // ========================= CREATE =========================

    if (dto.lat !== undefined && dto.lng !== undefined) {
      dto.locationGeo = {
        type: "Point",
        coordinates: [dto.lng, dto.lat],
      };
    }

    property = new this.propertyModel({
      ...dto,
      photos: Array.from(new Set(dto.photos || [])),
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
    const mongoFilter: FilterQuery<Property> = {
      status: true,
      isApproved: true,
    };

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
    dto: Partial<CreatePropertyDto> & { _id?: string },
    imageFiles?: Express.Multer.File[],
    userId?: string,
  ) {
    let photos: string[] = [];

    if (imageFiles?.length) {
      photos = await this.uploadFilesToCloudinary(imageFiles);
    } else {
      photos = dto.photos || [];
    }

    const uniquePhotos = Array.from(new Set(photos));

    if (dto.lat !== undefined && dto.lng !== undefined) {
      dto.locationGeo = {
        type: "Point",
        coordinates: [dto.lng, dto.lat],
      };
    }

    const filter = dto._id
      ? { _id: new Types.ObjectId(dto._id) }
      : { _id: new Types.ObjectId() };

    const update = {
      ...dto,
      photos: uniquePhotos,
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
    const filter: any = { status: true, isApproved: true };
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
      hostelType?: "male" | "female" | "mixed";
      amenities?: string[];
      bills?: string[];
      mealPlan?: string[];
      rules?: string[];
    },
    userId?: string,
  ): Promise<any> {
    const mongoFilter = buildMongoFilter(filters, userId);

    mongoFilter.isApproved = true;
    mongoFilter.status = true;
    let sortQuery: any = { featured: -1, _id: -1 };
    if (filters.sortBy === "price_asc") sortQuery = { monthlyRent: 1, _id: -1 };
    else if (filters.sortBy === "price_desc")
      sortQuery = { monthlyRent: -1, _id: -1 };
    else if (filters.sortBy === "newest")
      sortQuery = { createdAt: -1, _id: -1 };

    const normalizedPage = Number(page);
    const normalizedLimit = Number(limit);

    const [total, data] = await Promise.all([
      this.propertyModel.countDocuments(mongoFilter),
      this.propertyModel
        .find(mongoFilter)
        .sort(sortQuery)
        .skip((normalizedPage - 1) * normalizedLimit)
        .limit(normalizedLimit)
        .populate("ownerId", "name email phone profileImage")
        .lean(),
    ]);

    return {
      data,
      total,
      page: normalizedPage,
      limit: normalizedLimit,
      totalPages: Math.ceil(total / normalizedLimit),
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
    const escapedChars = cleaned
      .replace(/[-/\s]/g, "")
      .split("")
      .map((char) => char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

    const flexiblePattern = escapedChars.join("[-/\\s]?");

    const regex = new RegExp(flexiblePattern, "i");

    const results = await this.propertyModel.aggregate([
      {
        $match: {
          status: true,
          isApproved: true,
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
      ownerId: userId,
    };
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    if (city) {
      filter["address.city"] = city;
    }

    if (sort === "pending") {
      filter.isApproved = false;
    }

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
      isApproved: p.isApproved ?? false,
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
        },
      },
      // 1. Join the User (Owner)
      {
        $lookup: {
          from: "users",
          localField: "ownerObjId",
          foreignField: "_id",
          as: "owner",
        },
      },
      { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },

      // 2. Prepare the Agency ID and Join the Agency
      {
        $addFields: {
          // Ensure owner.agency is treated as an ObjectId for the next lookup
          "owner.agencyObjId": {
            $cond: [
              {
                $and: [
                  { $gt: ["$owner.agency", null] },
                  { $ne: ["$owner.agency", ""] },
                ],
              },
              { $toObjectId: "$owner.agency" },
              null,
            ],
          },
        },
      },
      {
        $lookup: {
          from: "agencies",
          localField: "owner.agencyObjId",
          foreignField: "_id",
          as: "owner.agencyDetails",
        },
      },
      {
        $unwind: {
          path: "$owner.agencyDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $project: {
          "owner.password": 0,
          "owner.refreshToken": 0,
          "owner.emailVerificationCode": 0,
          "owner.agencyObjId": 0,
          "owner.cnic": 0,
        },
      },
    ]);

    if (!property) throw new NotFoundException("Property not found");

    property.photos = Array.from(new Set(property.photos || []));

    const isOwner =
      userId && property.owner?._id?.toString() === userId.toString();
    property.chat = !isOwner && !!userId;

    this.propertyViewTracker.queueView(propertyId);

    return property;
  }

  async getFeaturedProperties(userId?: string) {
    const data = (await this.propertyModel
      .find({ status: true, isApproved: true })
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

    // Prevent _id override
    if (dto._id) delete dto._id;

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
  async findUnapprovedProperties(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [result] = await this.propertyModel.aggregate([
      { $match: { isApproved: false } },

      { $sort: { createdAt: -1 } },

      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $skip: skip },
            { $limit: limit },

            {
              $addFields: {
                ownerObjId: { $toObjectId: "$ownerId" },
              },
            },

            {
              $lookup: {
                from: "users",
                localField: "ownerObjId",
                foreignField: "_id",
                as: "ownerId",
              },
            },

            { $unwind: { path: "$ownerId", preserveNullAndEmptyArrays: true } },

            {
              $project: {
                "ownerId.password": 0,
                "ownerId.refreshToken": 0,
                ownerObjId: 0,
              },
            },
          ],
        },
      },
    ]);

    const total = result.metadata[0]?.total || 0;
    const properties = result.data || [];

    return {
      data: properties,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
  async approveProperty(propertyId: string) {
    const property = await this.propertyModel.findByIdAndUpdate(
      propertyId,
      { isApproved: true, status: true },
      { new: true },
    );

    if (!property) throw new NotFoundException("Property not found");
    return { message: "Property approved successfully", property };
  }
  async adminDeleteProperty(propertyId: string, adminUserId: string) {
    const property = await this.propertyModel.findById(propertyId);

    if (!property) {
      throw new NotFoundException("Property not found");
    }

    if (property.photos && property.photos.length > 0) {
      await this.deletedImagesService.addDeletedImages(
        property.photos,
        adminUserId,
        "property",
      );
    }

    await this.propertyModel.findByIdAndDelete(propertyId);

    return {
      success: true,
      message: "Property deleted by admin and images queued for removal.",
    };
  }
}
