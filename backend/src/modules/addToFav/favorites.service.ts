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

    const exists = await this.favModel.findOne({
      user: userObjectId,
      property: propertyObjectId,
    });

    if (exists) {
      throw new ConflictException("Already in favorites");
    }

    const fav = new this.favModel({
      user: userObjectId,
      property: propertyObjectId,
    });

    return fav.save();
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
      .populate("user", "email")
      .exec();
  }
}
