import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { CreatePropertyDto } from "./dto/create-property.dto";
import { CloudinaryService } from "src/services/Cloudinary Service/cloudinary.service";
import { Property } from "./property.schema";

@Injectable()
export class PropertyService {
  constructor(
    @InjectModel(Property.name) private propertyModel: Model<Property>,
    private readonly cloudinary: CloudinaryService
  ) {}

  async create(
    dto: CreatePropertyDto,
    files: Express.Multer.File[],
    userId: string
  ) {
    let imageUrls: string[] = [];

    if (files && files.length > 0) {
      imageUrls = await Promise.all(
        files.map(async (file) => {
          const uploaded = await this.cloudinary.uploadFile(file);
          return uploaded.secure_url;
        })
      );
    }

    const property = new this.propertyModel({
      ...dto,
      images: imageUrls,
      ownerId: new Types.ObjectId(userId),
    });

    return property.save();
  }

  async findAll() {
    return this.propertyModel.find().populate("ownerId", "name email");
  }

  async findMyProperties(userId: string) {
    return this.propertyModel
      .find({
        ownerId: new Types.ObjectId(userId),
      })
      .exec();
  }
  async findPropertyById(propertyId: string) {
    return this.propertyModel.findById(new Types.ObjectId(propertyId)).exec();
  }
  async updateProperty(
    id: string,
    dto: Partial<CreatePropertyDto>,
    userId: string,
    updatedAt : Number = Date.now()
  ) {
    const property = await this.propertyModel.findById(id);

    if (!property) {
      throw new NotFoundException("Property not found");
    }

    if (property.ownerId.toString() !== userId.toString()) {
      throw new UnauthorizedException(
        "You are not allowed to edit this property"
      );
    }

    Object.assign(property, dto);
    return property.save();
  }
  async findPropertyByIdAndDelete(propertyId: string) {
    return this.propertyModel.findByIdAndDelete(new Types.ObjectId(propertyId)).exec();
  }
}
