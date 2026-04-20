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
import {
  buildMongoFilter,
  formatLocationGeo,
  processPhotos,
  validateAndDeductCredits,
} from "./utils/property.utils";
import { validatePropertyPayload } from "./property.validation";
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
          results[currentIndex] = await mapper(
            items[currentIndex],
            currentIndex,
          );
        }
      }),
    );

    return results;
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
    page = 1,
    limit = 10,
    filters: any,
    userId?: string,
  ): Promise<any> {
    const mongoFilter = buildMongoFilter(filters, userId);
    if (userId) mongoFilter.ownerId = { $ne: userId };
    mongoFilter.isApproved = true;
    mongoFilter.status = true;
    mongoFilter.moderationStatus = "ACTIVE";

    // 3. Pagination Math
    const currentPage = Math.max(1, Number(page));
    const adjustedLimit = Math.max(1, Number(limit));
    const skip = (currentPage - 1) * adjustedLimit;
    const maxNeeded = skip + adjustedLimit;

    // 4. Sorting Logic
    let secondarySort: any = { createdAt: -1 };
    if (filters.sortBy === "price_asc") secondarySort = { monthlyRent: 1 };
    else if (filters.sortBy === "price_desc")
      secondarySort = { monthlyRent: -1 };
    else if (filters.sortBy === "newest") secondarySort = { createdAt: -1 };
    else if (filters.sortBy === "popular") secondarySort = { views: -1 };

    const finalSort = { ...secondarySort, _id: -1 };
    const featuredIds: string[] = []; // Placeholder for any specific exclusions

    const mainFilter = {
      ...mongoFilter,
      _id: { $nin: featuredIds },
    };

    // 5. Aggregate with Facets for Interleaving
    const results = await this.propertyModel.aggregate([
      { $match: mainFilter },
      {
        $facet: {
          weight3: [
            { $match: { sortWeight: 3 } },
            { $sort: finalSort },
            { $limit: maxNeeded * 2 },
          ],
          weight2: [
            { $match: { sortWeight: 2 } },
            { $sort: finalSort },
            { $limit: maxNeeded * 2 },
          ],
          weight1: [
            { $match: { sortWeight: 1 } },
            { $sort: finalSort },
            { $limit: maxNeeded * 2 },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    // Extract data from facets
    const w3Data = results[0].weight3 || [];
    const w2Data = results[0].weight2 || [];
    const w1Data = results[0].weight1 || [];
    const total = results[0].totalCount[0]?.count || 0;

    // 6. Pointer-Based Interleaving (O(N))
    const interleavedData: any[] = [];
    let w3Idx = 0,
      w2Idx = 0,
      w1Idx = 0;

    while (
      interleavedData.length < maxNeeded &&
      (w3Idx < w3Data.length || w2Idx < w2Data.length || w1Idx < w1Data.length)
    ) {
      // Step A: Weight 3 (Premium) - Up to 4 slots
      for (
        let i = 0;
        i < 4 && interleavedData.length < maxNeeded && w3Idx < w3Data.length;
        i++
      ) {
        interleavedData.push(w3Data[w3Idx++]);
      }
      // Step B: Weight 2 (Enhanced) - Up to 3 slots
      for (
        let i = 0;
        i < 3 && interleavedData.length < maxNeeded && w2Idx < w2Data.length;
        i++
      ) {
        interleavedData.push(w2Data[w2Idx++]);
      }
      // Step C: Weight 1 (Standard) - Up to 3 slots
      for (
        let i = 0;
        i < 3 && interleavedData.length < maxNeeded && w1Idx < w1Data.length;
        i++
      ) {
        interleavedData.push(w1Data[w1Idx++]);
      }
    }

    // 7. Final Slice for the specific page
    const paginatedData = interleavedData.slice(skip, skip + adjustedLimit);

    // 8. Populate Owner Data
    const populatedMainData = await this.propertyModel.populate(paginatedData, {
      path: "ownerId",
      select: "name email phone profileImage subscription",
    });

    // 9. Track Impressions (Non-blocking)
    const propertyIds = populatedMainData.map((p) => p._id);
    if (propertyIds.length > 0) {
      this.propertyModel
        .updateMany({ _id: { $in: propertyIds } }, { $inc: { impressions: 1 } })
        .exec()
        .catch((err) => console.error("Impression update failed", err));
    }

    // 10. Return formatted response
    return {
      data: populatedMainData,
      total,
      page: currentPage,
      limit: adjustedLimit,
      totalPages: Math.ceil(total / adjustedLimit),
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
    filters?: {
      hostOption?: string;
      status?: "active" | "inactive";
      approvalStatus?: "approved" | "pending";
      addressQuery?: string;
      minRent?: number;
      maxRent?: number;
    },
  ) {
    const filter: FilterQuery<any> = {
      ownerId: userId,
    };

    const searchRegex =
      search && search.trim()
        ? { $regex: search.trim(), $options: "i" }
        : undefined;
    if (searchRegex) {
      filter.$or = [
        { title: searchRegex },
        { location: searchRegex },
        { area: searchRegex },
        { "address.street": searchRegex },
        { "address.city": searchRegex },
      ];
    }

    if (city) {
      filter["address.city"] = city;
    }

    if (filters?.addressQuery?.trim()) {
      const addressRegex = {
        $regex: filters.addressQuery.trim(),
        $options: "i",
      };
      const existingOr = Array.isArray(filter.$or) ? filter.$or : [];
      filter.$or = [
        ...existingOr,
        { location: addressRegex },
        { area: addressRegex },
        { "address.street": addressRegex },
        { "address.city": addressRegex },
      ];
    }

    if (filters?.hostOption) {
      filter.hostOption = filters.hostOption;
    }

    if (filters?.status === "active") {
      filter.status = true;
    } else if (filters?.status === "inactive") {
      filter.status = false;
    }

    if (filters?.approvalStatus === "approved") {
      filter.isApproved = true;
    } else if (filters?.approvalStatus === "pending") {
      filter.isApproved = false;
    }

    if (
      filters?.minRent !== undefined ||
      filters?.maxRent !== undefined
    ) {
      const rentQuery: Record<string, number> = {};
      if (filters?.minRent !== undefined) {
        rentQuery.$gte = Number(filters.minRent);
      }
      if (filters?.maxRent !== undefined) {
        rentQuery.$lte = Number(filters.maxRent);
      }

      filter.$and = [
        ...(Array.isArray(filter.$and) ? filter.$and : []),
        {
          $or: [
            { monthlyRent: rentQuery },
            { weeklyRent: rentQuery },
            { dailyRent: rentQuery },
          ],
        },
      ];
    }

    if (sort === "pending") {
      filter.isApproved = false;
    }

    let sortOption: any = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };
    if (sort === "priceLow") sortOption = { monthlyRent: 1, createdAt: -1 };
    if (sort === "priceHigh") sortOption = { monthlyRent: -1, createdAt: -1 };

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
  async getOwnerDashboard(ownerId: string, page = 1, limit = 10) {
    const skip = (Number(page) - 1) * Number(limit);
    const pageSize = Number(limit);

    const stats = await this.propertyModel.aggregate([
      // 1. Filter by owner
      { $match: { ownerId: ownerId } },

      // 2. Multi-stage processing using Facets
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
          perPropertyStats: [
            { $sort: { views: -1 } },
            { $skip: skip },
            { $limit: pageSize },
            {
              $project: {
                title: 1,
                views: 1,
                impressions: { $ifNull: ["$impressions", 0] },
                sortWeight: 1,
                status: 1,
                thumbnail: { $arrayElemAt: ["$photos", 0] },
                ctr: {
                  $cond: [
                    { $gt: [{ $ifNull: ["$impressions", 0] }, 0] },
                    {
                      $multiply: [
                        {
                          $divide: ["$views", { $ifNull: ["$impressions", 1] }],
                        },
                        100,
                      ],
                    },
                    0,
                  ],
                },
              },
            },
          ],
        },
      },

      // 3. Final formatting to clean up facet arrays
      {
        $project: {
          totals: { $arrayElemAt: ["$totalStats", 0] },
          properties: "$perPropertyStats",
        },
      },
    ]);

    // 4. Handle Empty Results
    const result = stats[0] || {
      totals: {
        totalProperties: 0,
        totalViews: 0,
        totalImpressions: 0,
        activeListings: 0,
      },
      properties: [],
    };

    const totalItems = result.totals?.totalProperties || 0;

    return {
      totals: result.totals,
      data: result.properties,
      meta: {
        totalItems,
        itemCount: result.properties.length,
        itemsPerPage: pageSize,
        totalPages: Math.ceil(totalItems / pageSize),
        currentPage: Number(page),
      },
    };
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

    const validation = validatePropertyPayload(
      property.toObject() as unknown as Partial<CreatePropertyDto>,
    );

    if (!validation.valid) {
      property.status = false;
    } else if (dto.status !== undefined) {
      if (dto.status && !property.isApproved) {
        throw new BadRequestException(
          "This property must be approved before it can be activated.",
        );
      }

      property.status = dto.status;
    }

    return property.save();
  }

  async updatePropertyVisibility(
    propertyId: string,
    userId: string,
    nextStatus: boolean,
  ) {
    const property = await this.propertyModel.findById(propertyId);
    if (!property) throw new NotFoundException("Property not found");

    if (property.ownerId.toString() !== userId.toString()) {
      throw new UnauthorizedException(
        "You are not allowed to manage this property",
      );
    }

    if (nextStatus && !property.isApproved) {
      throw new BadRequestException(
        "Your listing can only go live after admin approval.",
      );
    }

    if (nextStatus && property.moderationStatus !== "ACTIVE") {
      throw new BadRequestException(
        "This listing cannot be activated in its current moderation state.",
      );
    }

    property.status = nextStatus;
    await property.save();

    return {
      message: nextStatus
        ? "Property activated successfully."
        : "Property deactivated successfully.",
      property,
    };
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
  async findUnapprovedProperties(page = 1, limit = 10, hostOption?: string) {
    const skip = (page - 1) * limit;

    const [result] = await this.propertyModel.aggregate([
      { $match: { isApproved: false, ...(hostOption ? { hostOption } : {}) } },

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

  async findAdminProperties(
    page = 1,
    limit = 10,
    filters?: {
      hostOption?: string;
      q?: string;
      approvalStatus?: "all" | "approved" | "pending";
      listingStatus?: "all" | "active" | "inactive";
    },
  ) {
    const skip = (page - 1) * limit;
    const match: Record<string, any> = {};

    if (filters?.hostOption) {
      match.hostOption = filters.hostOption;
    }

    if (filters?.approvalStatus === "approved") {
      match.isApproved = true;
    } else if (filters?.approvalStatus === "pending") {
      match.isApproved = false;
    }

    if (filters?.listingStatus === "active") {
      match.status = true;
    } else if (filters?.listingStatus === "inactive") {
      match.status = false;
    }

    if (filters?.q?.trim()) {
      const regex = new RegExp(filters.q.trim(), "i");
      match.$or = [
        { title: regex },
        { location: regex },
        { area: regex },
        { "address.street": regex },
        { "address.city": regex },
      ];
    }

    const [result] = await this.propertyModel.aggregate([
      { $match: match },
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

    const total = result?.metadata?.[0]?.total || 0;
    const data = result?.data || [];

    return {
      data,
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
