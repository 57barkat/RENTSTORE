import {
  BadRequestException,
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
import {
  processPhotos,
  formatLocationGeo,
  validateAndDeductCredits,
} from "./utils/property.utils";
@Injectable()
export class PropertyService {
  constructor(
    @InjectModel(Property.name) private propertyModel: Model<Property>,
    @InjectModel("PropertyDraft") private propertyDraftModel: Model<any>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
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

  async createOrUpdate(
    dto: Partial<CreatePropertyDto>,
    userId: string,
  ): Promise<{ property: Property; user: any }> {
    const propertyId = dto._id;

    // 1. Fetch User
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException("User not found");

    // 2. Data Pre-processing (Type Safe)
    const cleanedPhotos = processPhotos(dto.photos);
    dto.photos = cleanedPhotos; // Update DTO so it carries the clean array

    const locationGeo = formatLocationGeo(dto.lat, dto.lng);
    if (locationGeo) dto.locationGeo = locationGeo;

    // Internal helper to handle the credit save logic
    const handleCredits = async (isNew: boolean, isFeatured: boolean) => {
      const needsSave = validateAndDeductCredits(user, isNew, isFeatured);
      if (needsSave) await user.save();
    };

    // ========================= CASE A: UPDATE EXISTING =========================
    if (propertyId) {
      const existingProperty = await this.propertyModel.findById(propertyId);

      if (existingProperty) {
        if (existingProperty.ownerId.toString() !== userId.toString())
          throw new UnauthorizedException("Not allowed to edit this property");

        // Check if newly marking as featured
        if (dto.featured === true && existingProperty.featured !== true) {
          await handleCredits(false, true);
        }

        // Safe photo deletion check
        const photosToDelete = (existingProperty.photos || []).filter(
          (url) => !cleanedPhotos.includes(url),
        );
        if (photosToDelete.length > 0) {
          await this.deletedImagesService.addDeletedImages(
            photosToDelete,
            userId,
            "property",
          );
        }

        Object.assign(existingProperty, dto);
        return { property: await existingProperty.save(), user };
      }

      // ========================= CASE B: PROMOTE DRAFT =========================
      const draft = await this.propertyDraftModel.findById(propertyId);
      if (draft) {
        if (draft.ownerId.toString() !== userId.toString())
          throw new UnauthorizedException("Not allowed to promote draft");

        const wantsFeatured = dto.featured === true || draft.featured === true;
        await handleCredits(true, wantsFeatured);

        const { _id, ...draftData } = draft.toObject();
        const combinedPhotos = processPhotos([
          ...(dto.photos ?? []),
          ...(draftData.photos ?? []),
        ]);

        const property = new this.propertyModel({
          ...draftData,
          ...dto,
          photos: combinedPhotos,
          ownerId: userId,
          status: true,
          isApproved: false,
        });

        const savedProperty = await property.save();
        await this.propertyDraftModel.findByIdAndDelete(propertyId);

        user.usedPropertyCount = (user.usedPropertyCount || 0) + 1;
        return { property: savedProperty, user: await user.save() };
      }

      throw new NotFoundException("Property or Draft not found");
    }

    // ========================= CASE C: NEW CREATE =========================
    await handleCredits(true, dto.featured === true);

    const property = new this.propertyModel({
      ...dto,
      photos: cleanedPhotos,
      ownerId: userId,
      status: true,
    });

    const savedProperty = await property.save();
    user.usedPropertyCount = (user.usedPropertyCount || 0) + 1;

    return { property: savedProperty, user: await user.save() };
  }

  async promoteToFeatured(
    propertyId: string,
    userId: string,
  ): Promise<{ property: Property; user: any }> {
    const property = await this.propertyModel.findById(propertyId);
    if (!property) throw new NotFoundException("Property not found");

    if (property.ownerId.toString() !== userId) {
      throw new UnauthorizedException("You do not own this property");
    }

    if (!property.isApproved) {
      throw new BadRequestException(
        "Property must be approved before it can be featured.",
      );
    }

    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException("User not found.");

    const availableCredits = Number(user.paidFeaturedCredits) || 0;

    if (availableCredits <= 0) {
      throw new BadRequestException({
        message: "You do not have enough Featured Credits.",
        foundCredits: user.paidFeaturedCredits,
      });
    }

    if (Array.isArray(property.address) && property.address.length === 0) {
      property.address = undefined;
    }

    const fifteenDaysFromNow = new Date();
    fifteenDaysFromNow.setDate(fifteenDaysFromNow.getDate() + 15);

    property.featured = true;
    property.featuredUntil = fifteenDaysFromNow;

    user.paidFeaturedCredits = availableCredits - 1;
    const updatedUser = await user.save();

    const savedProperty = await property.save({ validateBeforeSave: false });

    return {
      property: savedProperty,
      user: updatedUser,
    };
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
    filters: any,
    userId?: string,
  ): Promise<any> {
    const mongoFilter = buildMongoFilter(filters, userId);

    mongoFilter.isApproved = true;
    mongoFilter.status = true;
    mongoFilter.moderationStatus = "ACTIVE";

    let secondarySort: any = { _id: -1 };
    if (filters.sortBy === "price_asc")
      secondarySort = { monthlyRent: 1, _id: -1 };
    else if (filters.sortBy === "price_desc")
      secondarySort = { monthlyRent: -1, _id: -1 };
    else if (filters.sortBy === "newest")
      secondarySort = { createdAt: -1, _id: -1 };
    const sortQuery = {
      featured: -1,
      ...secondarySort,
    };

    const total = await this.propertyModel.countDocuments(mongoFilter);

    const data = await this.propertyModel
      .find(mongoFilter)
      .sort(sortQuery as any)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate("ownerId", "name email phone profileImage")
      .lean();
    const now = new Date();
    const processedData = data.map((property) => {
      const isExpired =
        property.featuredUntil && new Date(property.featuredUntil) < now;
      return {
        ...property,
        featured: isExpired ? false : property.featured,
      };
    });

    return {
      data: processedData,
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
    console.log("Finding properties for user:", userId);
    const filter: FilterQuery<any> = {
      ownerId: userId,
    };
    console.log("Base filter:", filter);
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    if (city) {
      filter.city = city;
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
    console.log(result);
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
