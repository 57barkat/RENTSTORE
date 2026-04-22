import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DeletedImage } from "./deletedImage.schema";
import { CloudinaryService } from "../services/Cloudinary Service/cloudinary.service";

@Injectable()
export class DeletedImagesService {
  private readonly logger = new Logger(DeletedImagesService.name);
  private static readonly CLEANUP_BATCH_SIZE = 50;

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
    while (true) {
      const images = await this.deletedImageModel
        .find({})
        .sort({ createdAt: 1, _id: 1 })
        .limit(DeletedImagesService.CLEANUP_BATCH_SIZE)
        .lean();

      if (!images.length) {
        return;
      }

      for (const image of images) {
        try {
          await this.cloudinary.deleteFileByUrl(image.url);
          await this.deletedImageModel.findByIdAndDelete(image._id);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown cleanup failure";
          this.logger.warn(
            `Failed to delete queued image ${image.url}: ${message}`,
          );
        }
      }

      if (images.length < DeletedImagesService.CLEANUP_BATCH_SIZE) {
        return;
      }
    }
  }
}
