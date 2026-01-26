import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DeletedImage } from "./deletedImage.schema";
import { CloudinaryService } from "../services/Cloudinary Service/cloudinary.service";

@Injectable()
export class DeletedImagesService {
  constructor(
    @InjectModel(DeletedImage.name)
    private deletedImageModel: Model<DeletedImage>,
    private cloudinary: CloudinaryService,
  ) {}

  async addDeletedImages(
    urls: string[],
    userId: string,
    entityType: "property" | "draft" = "property",
  ) {
    if (!urls?.length) return;
    const docs = urls.map((url) => ({ url, userId, entityType }));
    await this.deletedImageModel.insertMany(docs);
  }

  async cleanUpDeletedImages() {
    const images = await this.deletedImageModel.find({}).lean();
    if (!images.length) return;

    await Promise.all(
      images.map(async (img) => {
        try {
          await this.cloudinary.deleteFileByUrl(img.url);
          await this.deletedImageModel.findByIdAndDelete(img._id);
        } catch (error) {
          console.error(`Failed to delete image ${img.url}:`, error);
        }
      }),
    );
  }
}
