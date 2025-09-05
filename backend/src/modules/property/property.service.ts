import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
 
import { CreatePropertyDto } from './dto/create-property.dto';
import { CloudinaryService } from 'src/services/Cloudinary Service/cloudinary.service';
import { Property } from './property.schema';
 

@Injectable()
export class PropertyService {
  constructor(
    @InjectModel(Property.name) private propertyModel: Model<Property>,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async create(
    dto: CreatePropertyDto,
    files: Express.Multer.File[],
    userId: string,
  ) {
    let imageUrls: string[] = [];

    if (files && files.length > 0) {
      imageUrls = await Promise.all(
        files.map(async (file) => {
          const uploaded = await this.cloudinary.uploadFile(file);
          return uploaded.secure_url;
        }),
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
    return this.propertyModel.find().populate('ownerId', 'name email');
  }

  async findMyProperties(userId: string) {
    return this.propertyModel.find({ ownerId: userId });
  }
}
