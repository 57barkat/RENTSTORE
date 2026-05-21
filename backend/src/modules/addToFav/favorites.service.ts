import { ConflictException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AddToFav } from "./favorite.entity";
import { CloudinaryService } from "../../services/Cloudinary Service/cloudinary.service";

@Injectable()
export class AddToFavService {
  constructor(
    @InjectModel(AddToFav.name) private favModel: Model<AddToFav>,
    private readonly cloudinary: CloudinaryService,
  ) {}

  private withPublicDisplayPropertyImages<T>(favorite: T): T {
    if (!favorite || typeof favorite !== "object") {
      return favorite;
    }

    const record = { ...(favorite as Record<string, any>) };
    const property = record.property;

    if (!property || typeof property !== "object") {
      return record as T;
    }

    // Favorite responses are public-facing saved listing views. Keep stored
    // property photos clean, but return watermarked delivery URLs for display.
    record.property = {
      ...property,
      photos: this.cloudinary.buildWatermarkedDisplayUrls(property.photos),
    };

    return record as T;
  }

  async addFavorite(userId: string, propertyId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const propertyObjectId = new Types.ObjectId(propertyId);

    try {
      return await this.favModel.create({
        user: userObjectId,
        property: propertyObjectId,
      });
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new ConflictException("Already in favorites");
      }
      throw error;
    }
  }

  async removeFavorite(userId: string, propertyId: string) {
    return this.favModel.findOneAndDelete({
      user: new Types.ObjectId(userId),
      property: new Types.ObjectId(propertyId),
    });
  }

  async getUserFavorites(userId: string) {
    const favorites = await this.favModel
      .find({ user: new Types.ObjectId(userId) })
      .populate("property")
      .lean()
      .exec();

    return favorites.map((favorite) =>
      this.withPublicDisplayPropertyImages(favorite),
    );
  }

  async getUserFavoriteIds(userId: string) {
    const favs = await this.favModel
      .find({ user: new Types.ObjectId(userId) })
      .select("property")
      .lean();
    return favs.map((f) => f.property.toString());
  }
}
