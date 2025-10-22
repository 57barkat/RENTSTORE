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

  async uploadFile(file: Express.Multer.File | any): Promise<any> {
    if (!file) throw new Error("No file provided for upload");

    const mime = file.mimetype || "image/jpeg";
    const isImage = mime.startsWith("image/");

    const uploadOptions: UploadApiOptions = {
      resource_type: isImage ? "image" : "video",
    };

    return new Promise(async (resolve, reject) => {
      try {
        let fileBuffer: Buffer;

        if (file.buffer) {
          fileBuffer = file.buffer;
        } else if (file.path) {
          fileBuffer = require("fs").readFileSync(file.path);
        } else {
          throw new Error("File must contain buffer or path");
        }

        if (isImage) {
          fileBuffer = await sharp(fileBuffer)
            .resize(800)
            .jpeg({ quality: 80 })
            .toBuffer();
        } else {
          uploadOptions.quality = "auto:good";
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
