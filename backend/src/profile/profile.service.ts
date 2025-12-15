import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CloudinaryService } from "src/services/Cloudinary Service/cloudinary.service";
import { User, UserDocument } from "src/modules/user/user.entity";
import { Property } from "src/modules/property/property.schema";
import { AddToFavService } from "src/modules/addToFav/favorites.service";
import { DeletedImagesService } from "src/deletedImages/deletedImages.service";

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Property.name) private propertyModel: Model<Property>,
    private readonly favService: AddToFavService,
    private readonly cloudinary: CloudinaryService,
    private readonly deletedImagesService: DeletedImagesService
  ) {}

  async uploadProfileImage(userId: string, file: Express.Multer.File) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException("User not found");

    if (user.profileImage) {
      await this.cloudinary.deleteFileByUrl(user.profileImage);
    }

    const uploaded = await this.cloudinary.uploadFile(file);
    user.profileImage = uploaded.secure_url;
    await user.save();

    return { profileImage: user.profileImage };
  }

  async getUserStats(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException("User not found");

    const totalProperties = await this.propertyModel.countDocuments({
      ownerId: new Types.ObjectId(userId),
      status: true,
    });

    const totalFavorites =
      (await this.favService.getUserFavoriteIds(userId)).length || 0;

    return {
      profileImage: user.profileImage || null,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      totalProperties,
      totalFavorites,
    };
  }
}
