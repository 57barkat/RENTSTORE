import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v2 as cloudinary, UploadApiOptions } from "cloudinary";
import * as streamifier from "streamifier";
import sharp from "sharp";

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    const cloudName = this.configService.get<string>("CLOUDINARY_CLOUD_NAME");
    const apiKey = this.configService.get<string>("CLOUDINARY_API_KEY");
    const apiSecret = this.configService.get<string>("CLOUDINARY_API_SECRET");

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error(
        "Cloudinary configuration missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment."
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<any> {
    const isImage = file.mimetype.startsWith("image/");

    // Cloudinary upload options
    const uploadOptions: UploadApiOptions = {
      resource_type: isImage ? "image" : "video",
    };

    return new Promise(async (resolve, reject) => {
      try {
        let fileBuffer = file.buffer;

        // Use sharp for image compression
        if (isImage) {
          fileBuffer = await sharp(file.buffer)
            .resize(800)
            .jpeg({ quality: 80 })
            .toBuffer();
        } else {
          // For videos, use Cloudinary's built-in compression features.
          // You can define a custom named transformation for video compression
          // or use automatic settings.
          // For this example, we'll use a simple `quality` parameter.
          // Cloudinary automatically optimizes videos based on the `quality` setting.
          // We can also set a max duration for the video.
          uploadOptions.quality = "auto:good";
          uploadOptions.duration = "30"; // Max 30 seconds
        }

        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );

        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
      } catch (error) {
        reject(error);
      }
    });
  }
}
