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

  /** -----------------------------
   * Upload file (image or video)
   * Returns full Cloudinary result (url, public_id, etc.)
   * ----------------------------- */
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
            resolve(result); // contains secure_url, public_id, etc.
          }
        );

        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
      } catch (error) {
        reject(error);
      }
    });
  }

  /** -----------------------------
   * Extract Cloudinary public_id from stored URL
   * Example:
   * URL: https://res.cloudinary.com/demo/image/upload/v123456/property_photo.jpg
   * public_id: property_photo
   * ----------------------------- */
  getPublicIdFromUrl(url: string): string | null {
    try {
      const parts = url.split("/");
      const fileWithExt = parts[parts.length - 1];
      const publicId = fileWithExt.split(".")[0];
      return publicId;
    } catch (error) {
      console.error("Failed to extract publicId from URL:", url, error);
      return null;
    }
  }

  async deleteFileByUrl(url: string): Promise<boolean> {
    try {
      const publicId = this.getPublicIdFromUrl(url);
      if (!publicId) return false;

      const result = await cloudinary.uploader.destroy(publicId);
      console.log("Cloudinary delete result:", result);
      return result.result === "ok" || result.result === "not_found";
    } catch (error) {
      console.error("Cloudinary delete error:", error);
      return false;
    }
  }
}
