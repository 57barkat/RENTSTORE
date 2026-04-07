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

  async promoteListing(
    propertyId: string,
    userId: string,
    type: "boost" | "featured",
  ): Promise<{ property: Property; user: any }> {
    // 1. Basic Validations
    const property = await this.propertyModel.findById(propertyId);
    if (!property) throw new NotFoundException("Property not found");

    if (property.ownerId.toString() !== userId) {
      throw new UnauthorizedException("You do not own this property");
    }

    if (!property.isApproved) {
      throw new BadRequestException(
        "Property must be approved before promotion.",
      );
    }

    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException("User not found.");

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 15);

    if (type === "featured") {
      const credits = Number(user.paidFeaturedCredits) || 0;
      if (credits <= 0)
        throw new BadRequestException("No Featured Credits remaining.");

      property.featured = true;
      property.featuredUntil = expirationDate;
      property.sortWeight = 3;
      user.paidFeaturedCredits = credits - 1;
    } else if (type === "boost") {
      const slots = Number(user.prioritySlotCredits) || 0;
      if (slots <= 0)
        throw new BadRequestException("No Boost Slots remaining.");

      property.isBoosted = true;

      property.sortWeight = 2;
      user.prioritySlotCredits = slots - 1;
    }

    if (Array.isArray(property.address) && property.address.length === 0) {
      property.address = undefined;
    }

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
  async incrementViews(propertyId: string) {
    return await this.propertyModel
      .findByIdAndUpdate(propertyId, { $inc: { views: 1 } }, { new: true })
      .exec();
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
    page = 1, // Default to page 1 if not provided
    limit = 10, // Default to 10 items per page
    filters: any, // Object containing user-selected filters (price, type, etc.)
    userId?: string, // Optional ID to exclude the user's own properties
  ): Promise<any> {
    // Generate the base MongoDB query object from provided filters
    const mongoFilter = buildMongoFilter(filters, userId);

    // If a user is logged in, exclude their own properties from the results
    if (userId) mongoFilter.ownerId = { $ne: userId };

    // Hardcoded constraints: only show approved, active, and moderated properties
    mongoFilter.isApproved = true;
    mongoFilter.status = true;
    mongoFilter.moderationStatus = "ACTIVE";

    // Calculate how many items to skip based on the current page
    const skip = (Number(page) - 1) * Number(limit);
    const now = new Date(); // Current timestamp for date comparisons
    const sortOptions = {};
    // Determine the secondary sort order based on user selection
    let secondarySort: any = { createdAt: -1 }; // Default: Newest first
    if (filters.sortBy === "price_asc")
      secondarySort = { monthlyRent: 1 }; // Cheapest first
    else if (filters.sortBy === "price_desc")
      secondarySort = { monthlyRent: -1 }; // Most expensive first
    else if (filters.sortBy === "newest") secondarySort = { createdAt: -1 };
    else if (filters.sortBy === "popular") {
      sortOptions["views"] = -1;
    }

    // Combine secondary sort with _id to ensure consistent pagination order
    const finalSort = { ...secondarySort, _id: -1 };

    // Placeholder for Featured Ads (currently skipped/empty)
    const featuredIds: string[] = [];

    // Since no featured ads are fetched, the full limit is available for regular ads
    const adjustedLimit = Number(limit);

    // Build the main filter, explicitly excluding featured properties and specific IDs
    const mainFilter = {
      ...mongoFilter,
      // featured: true,
      _id: { $nin: featuredIds }, // Exclude IDs already picked as featured
    };

    // Execute a multi-bucket aggregation to group properties by their weight
    const results = await this.propertyModel.aggregate([
      { $match: mainFilter }, // Filter the entire collection first
      {
        $facet: {
          // Group properties with sortWeight 3 (Business Pro)
          weight3: [
            { $match: { sortWeight: 3 } },
            { $sort: finalSort },
            { $limit: skip + adjustedLimit * 5 }, // Fetch enough for deep pagination
          ],
          // Group properties with sortWeight 2 (Standard Pro)
          weight2: [
            { $match: { sortWeight: 2 } },
            { $sort: finalSort },
            { $limit: skip + adjustedLimit * 5 },
          ],
          // Group properties with sortWeight 1 (Free/Basic)
          weight1: [
            { $match: { sortWeight: 1 } },
            { $sort: finalSort },
            { $limit: skip + adjustedLimit * 5 },
          ],
          // Get total count of all matching properties for pagination meta-data
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    // Create local copies of each weight group for manipulation
    const w3Copy = [...(results[0].weight3 || [])];
    const w2Copy = [...(results[0].weight2 || [])];
    const w1Copy = [...(results[0].weight1 || [])];
    const totalRegular = results[0].totalCount[0]?.count || 0;
    const total = totalRegular;

    // This array will hold the properties in the specific interleaved order
    const interleavedData: any[] = [];
    // Calculate total items needed (skipped items + items for current page)
    const maxNeeded = skip + adjustedLimit;

    // Begin the 4:3:3 Interleaving process
    while (
      (w3Copy.length > 0 || w2Copy.length > 0 || w1Copy.length > 0) &&
      interleavedData.length < maxNeeded
    ) {
      // 1. Take up to 4 items from Weight 3
      for (let i = 0; i < 4 && interleavedData.length < maxNeeded; i++) {
        if (w3Copy.length > 0) interleavedData.push(w3Copy.shift());
      }
      // 2. Take up to 3 items from Weight 2
      for (let i = 0; i < 3 && interleavedData.length < maxNeeded; i++) {
        if (w2Copy.length > 0) interleavedData.push(w2Copy.shift());
      }
      // 3. Take up to 3 items from Weight 1
      for (let i = 0; i < 3 && interleavedData.length < maxNeeded; i++) {
        if (w1Copy.length > 0) interleavedData.push(w1Copy.shift());
      }
    }

    // Extract only the items meant for the current page (e.g., items 10-20)
    const paginatedData = interleavedData.slice(skip, skip + adjustedLimit);

    // Populate owner details (Name, Image, Subscription) for the final result set
    const populatedMainData = await this.propertyModel.populate(paginatedData, {
      path: "ownerId",
      select: "name email phone profileImage subscription",
    });
    const propertyIds = populatedMainData.map((p) => p._id);

    if (propertyIds.length > 0) {
      // We don't use 'await' here because we don't want the user
      // to wait for the database write before seeing their search results.
      this.propertyModel
        .updateMany({ _id: { $in: propertyIds } }, { $inc: { impressions: 1 } })
        .exec()
        .catch((err) => console.error("Impression update failed", err));
    }
    // Return formatted response with data and pagination metadata
    return {
      data: populatedMainData, // The interleaved and paginated properties
      total, // Total number of properties matching filters
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)), // Calculate total pages
      message:
        populatedMainData.length > 0
          ? "Fetched successfully."
          : "No results found.",
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
  async getOwnerDashboard(ownerId: string) {
    const stats = await this.propertyModel.aggregate([
      // 1. Filter only properties belonging to this owner
      { $match: { ownerId: ownerId } },

      // 2. Group all properties to calculate global totals
      {
        $facet: {
          totalStats: [
            {
              $group: {
                _id: null,
                totalProperties: { $sum: 1 },
                totalViews: { $sum: "$views" },
                totalImpressions: { $sum: { $ifNull: ["$impressions", 0] } },
                activeListings: {
                  $sum: { $cond: [{ $eq: ["$status", true] }, 1, 0] },
                },
              },
            },
          ],
          // 3. Get the specific performance of each property
          perPropertyStats: [
            { $sort: { views: -1 } }, // Show most popular first
            { $limit: 10 }, // Limit to top 10 for mobile performance
            {
              $project: {
                title: 1,
                views: 1,
                impressions: { $ifNull: ["$impressions", 0] },
                sortWeight: 1,
                status: 1,
                thumbnail: { $arrayElemAt: ["$photos", 0] },
                // Calculate Click-Through Rate (CTR) percentage
                ctr: {
                  $cond: [
                    { $gt: ["$impressions", 0] },
                    {
                      $multiply: [{ $divide: ["$views", "$impressions"] }, 100],
                    },
                    0,
                  ],
                },
              },
            },
          ],
        },
      },
      // 4. Clean up the output format
      {
        $project: {
          totals: { $arrayElemAt: ["$totalStats", 0] },
          properties: "$perPropertyStats",
        },
      },
    ]);

    return (
      stats[0] || {
        totals: { totalProperties: 0, totalViews: 0, totalImpressions: 0 },
        properties: [],
      }
    );
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
