import { ConflictException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AddToFav } from "./favorite.entity";

@Injectable()
export class AddToFavService {
  constructor(@InjectModel(AddToFav.name) private favModel: Model<AddToFav>) {}

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
    return this.favModel
      .find({ user: new Types.ObjectId(userId) })
      .populate("property")
      .lean()
      .exec();
  }

  async getUserFavoriteIds(userId: string) {
    const favs = await this.favModel
      .find({ user: new Types.ObjectId(userId) })
      .select("property")
      .lean();
    return favs.map((f) => f.property.toString());
  }
}
