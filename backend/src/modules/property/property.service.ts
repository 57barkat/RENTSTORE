import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { CreatePropertyDto, PropertyWithFav } from "./dto/create-property.dto";
import { CloudinaryService } from "../../services/Cloudinary Service/cloudinary.service";
import { Property } from "./property.schema";
import { AddToFavService } from "../addToFav/favorites.service";
import { DeletedImagesService } from "../../deletedImages/deletedImages.service";
import { buildPropertyFilter } from "./utils/property-filter.util";

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
    let property: Property | null;

    if (dto._id) {
      // Update existing
      property = await this.propertyModel.findById(dto._id);
      if (!property) throw new NotFoundException("Property not found");
      if (property.ownerId.toString() !== userId.toString())
        throw new UnauthorizedException("Not allowed");

      // Queue old photos that are being removed
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

      // Only assign fields that exist in DTO
      for (const key of Object.keys(dto)) {
        if (dto[key] !== undefined) {
          property[key] = dto[key];
        }
      }

      property = await property.save();
    } else {
      // New property
      property = new this.propertyModel({ ...dto, ownerId: userId });
      property = await property.save();
    }

    return property;
  }

  async saveDraft(
    dto: Partial<CreatePropertyDto>,
    imageFiles?: Express.Multer.File[],
    userId?: string,
  ) {
    const photos: string[] = imageFiles?.length
      ? await this.uploadFilesToCloudinary(imageFiles)
      : dto.photos || [];

    const draft = new this.propertyDraftModel({
      ...dto,
      photos,
      ownerId: new Types.ObjectId(userId),
      status: "draft",
    });

    return draft.save();
  }

  async getAllDrafts(userId: string) {
    const drafts = await this.propertyModel
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
        .sort({ featured: -1, _id: -1 }) // ✅ Featured first, then latest
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

  async findFiltered(page = 1, limit = 10, filters: any, userId?: string) {
    const filter = buildPropertyFilter(filters);

    const FEATURED_LIMIT = Math.floor(limit / 2);
    const NORMAL_LIMIT = limit - FEATURED_LIMIT;

    const featuredSkip = (page - 1) * FEATURED_LIMIT;
    const normalSkip = (page - 1) * NORMAL_LIMIT;

    const featured = await this.propertyModel
      .find({ ...filter, featured: true })
      .sort({ _id: -1 })
      .skip(featuredSkip)
      .limit(FEATURED_LIMIT)
      .populate("ownerId", "name email")
      .lean();

    const nonFeatured = await this.propertyModel
      .find({ ...filter, featured: { $ne: true } })
      .sort({ _id: -1 })
      .skip(normalSkip)
      .limit(NORMAL_LIMIT)
      .populate("ownerId", "name email")
      .lean();

    let data = [...featured, ...nonFeatured];

    if (userId) {
      const favIds = await this.favService.getUserFavoriteIds(userId);
      data = data.map((p) => ({
        ...p,
        isFav: favIds.includes(p._id.toString()),
      }));
    }

    const totalCount = await this.propertyModel.countDocuments(filter);

    return {
      data,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
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
    userId: string,
  ) {
    const property = await this.propertyModel.findById(id);
    if (!property) throw new NotFoundException("Property not found");

    if (property.ownerId.toString() !== userId.toString()) {
      throw new UnauthorizedException(
        "You are not allowed to edit this property",
      );
    }

    // Merge incoming updates
    Object.assign(property, dto);

    // Robust status calculation
    const isFilled = (value: any): boolean => {
      if (value === null || value === undefined) return false;
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "object") return Object.keys(value).length > 0;
      if (typeof value === "string") return value.trim() !== "";
      return true;
    };

    // Define required fields for completion
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

  // PropertyService.ts
  async findPropertyByIdAndDelete(propertyId: string, userId: string) {
    const property = await this.propertyModel.findById(propertyId);

    if (!property) throw new NotFoundException("Property not found");

    // Queue images for later deletion
    if (property.photos?.length) {
      await this.deletedImagesService.addDeletedImages(
        property.photos,
        userId,
        "property",
      );
    }

    // Delete property from DB
    await this.propertyModel.findByIdAndDelete(propertyId);

    return {
      message: "Property deleted, photos queued for Cloudinary cleanup",
    };
  }

  async deleteDraftById(draftId: string, userId: string) {
    const draft = await this.propertyDraftModel.findById(draftId);

    if (!draft) throw new NotFoundException("Draft not found");
    if (draft.ownerId.toString() !== userId.toString()) {
      throw new UnauthorizedException(
        "You are not allowed to delete this draft",
      );
    }

    // Queue draft images for later deletion
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
