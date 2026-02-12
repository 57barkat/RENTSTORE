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
import {
  buildPropertyFilter,
  buildSmartRelaxedFilter,
  PropertyFilters,
  RelaxedFilterResult,
} from "./utils/property-filter.util";
import { normalizeText } from "src/common/utils/normalize.util";

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
      // 1. Try to find in main Property collection
      property = await this.propertyModel.findById(propertyId);

      if (property) {
        // --- UPDATE EXISTING PROPERTY ---
        if (property.ownerId.toString() !== userId.toString())
          throw new UnauthorizedException("Not allowed to edit this property");

        // Photo cleanup logic
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

        // Apply updates
        Object.assign(property, dto);
        return await property.save();
      }

      // 2. If not in main, check if it's a Draft being promoted
      const draft = await this.propertyDraftModel.findById(propertyId);
      if (draft) {
        if (draft.ownerId.toString() !== userId.toString())
          throw new UnauthorizedException("Not allowed to promote this draft");

        // Create new property from draft data + current DTO
        const { _id, ...draftData } = draft.toObject();
        property = new this.propertyModel({
          ...draftData,
          ...dto,
          ownerId: userId,
          status: true, // Mark as active property
        });

        const savedProperty = await property.save();

        // 3. DELETE THE DRAFT now that it's a real property
        await this.propertyDraftModel.findByIdAndDelete(propertyId);

        return savedProperty;
      }

      // 4. If ID was provided but found nowhere
      throw new NotFoundException(
        "Property or Draft not found with provided ID",
      );
    }

    // 5. NO ID PROVIDED: Create brand new property
    property = new this.propertyModel({
      ...dto,
      ownerId: userId,
      status: true,
    });
    return await property.save();
  }

  async saveDraft(
    dto: Partial<CreatePropertyDto>,
    imageFiles?: Express.Multer.File[],
    userId?: string,
  ) {
    const photos: string[] = imageFiles?.length
      ? await this.uploadFilesToCloudinary(imageFiles)
      : dto.photos || [];

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

  async getAllDrafts(userId: string) {
    const drafts = await this.propertyDraftModel
      .find({ ownerId: new Types.ObjectId(userId), status: false })
      .sort({ createdAt: -1 })
      .lean();

    return drafts;
  }

  async findAll(page = 1, limit = 10, ownerId?: string) {
    const filter: any = { status: true };
    if (ownerId) {
      filter.ownerId = ownerId;
    }

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
    filters: PropertyFilters & { sortBy?: string },
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
    } = filters;

    const mongoFilter: FilterQuery<any> = { status: true };
    if (userId) {
      mongoFilter.ownerId = { $ne: new Types.ObjectId(userId) };
    }
    const andConditions: any[] = [];

    /* ---------------- CITY ---------------- */
    if (city) {
      andConditions.push({
        address: {
          $elemMatch: { city: { $regex: city, $options: "i" } },
        },
      });
    }

    /* ---------------- ADDRESS QUERY ---------------- */
    if (addressQuery) {
      // Normalize input: lowercase and remove spaces/dashes
      const cleanedQuery = addressQuery
        .trim()
        .toLowerCase()
        .replace(/[-\s]/g, "");

      const orConditions = [
        // Match against title
        { title: { $regex: cleanedQuery, $options: "i" } },

        // Match against location (remove spaces/dashes)
        {
          location: {
            $regex: cleanedQuery.split("").join("[-\\s]?"), // F7 => F[-\s]?7
            $options: "i",
          },
        },

        // Match against street inside address array
        {
          address: {
            $elemMatch: {
              street: {
                $regex: cleanedQuery.split("").join("[-\\s]?"),
                $options: "i",
              },
            },
          },
        },

        // Match against city
        {
          address: {
            $elemMatch: {
              city: { $regex: cleanedQuery, $options: "i" },
            },
          },
        },

        // Match against stateTerritory
        {
          address: {
            $elemMatch: {
              stateTerritory: { $regex: cleanedQuery, $options: "i" },
            },
          },
        },
      ];

      andConditions.push({ $or: orConditions });
    }

    /* ---------------- RENT RANGE ---------------- */
    if (minRent !== undefined || maxRent !== undefined) {
      mongoFilter.monthlyRent = {};
      if (minRent !== undefined) mongoFilter.monthlyRent.$gte = Number(minRent);
      if (maxRent !== undefined) mongoFilter.monthlyRent.$lte = Number(maxRent);
    }

    /* ---------------- CAPACITY ---------------- */
    if (bedrooms !== undefined)
      mongoFilter["capacityState.bedrooms"] = Number(bedrooms);
    if (bathrooms !== undefined)
      mongoFilter["capacityState.bathrooms"] = Number(bathrooms);
    if (floorLevel !== undefined)
      mongoFilter["capacityState.floorLevel"] = Number(floorLevel);

    /* ---------------- HOST OPTION ---------------- */
    if (hostOption) {
      mongoFilter.hostOption = { $regex: `^${hostOption}$`, $options: "i" };
    }

    /* ---------------- APPLY AND CONDITIONS ---------------- */
    if (andConditions.length) {
      mongoFilter.$and = andConditions;
    }
    let sortQuery: any = { featured: -1, _id: -1 };
    if (sortBy === "price_asc") {
      sortQuery = { monthlyRent: 1, _id: -1 };
    } else if (sortBy === "price_desc") {
      sortQuery = { monthlyRent: -1, _id: -1 };
    } else if (sortBy === "newest") {
      sortQuery = { createdAt: -1, _id: -1 };
    }
    /* ---------------- COUNT & FETCH ---------------- */
    const total = await this.propertyModel.countDocuments(mongoFilter);

    const data = await this.propertyModel
      .find(mongoFilter)
      .sort(sortQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("ownerId", "name email")
      .lean();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      message:
        data.length > 0
          ? "Matches found!"
          : "No properties found matching your criteria.",
    };
  }

  async findMyProperties(userId: string) {
    const data = (await this.propertyModel
      .find({ ownerId: new Types.ObjectId(userId) })
      .populate("ownerId", "name email")
      .lean()) as unknown as PropertyWithFav[];

    const favIds = await this.favService.getUserFavoriteIds(userId);

    const filteredData = data
      .filter((p) => p.status !== false)
      .map((p) => ({
        ...p,
        isFav: favIds.includes(p._id.toString()),
      }));

    return filteredData;
  }

  async findPropertyById(propertyId: string, userId?: string) {
    const objectId = new Types.ObjectId(propertyId);

    const [property] = await this.propertyModel.aggregate([
      { $match: { _id: objectId } },
      {
        $addFields: {
          // This converts String to ObjectId but stays an ObjectId if it already is one
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
      {
        $unwind: {
          path: "$owner",
          preserveNullAndEmptyArrays: true, // <--- Prevents document from disappearing if owner lookup fails
        },
      },
      {
        $project: {
          "owner.password": 0,
          "owner.refreshToken": 0,
          // ... rest of your exclusions
        },
      },
    ]);

    // 1. Check if property exists first
    if (!property) throw new NotFoundException("Property not found");

    // 2. Use Optional Chaining (?.) to safely check the owner
    const isOwner =
      userId && property.owner?._id?.toString() === userId.toString();

    property.chat = !isOwner && !!userId;

    // 3. Increment the real DB counter
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
