import { BadRequestException } from "@nestjs/common";
import type { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";

export const PROPERTY_UPLOAD_MAX_IMAGES = 50;
export const PROPERTY_UPLOAD_MAX_FILE_SIZE = 5 * 1024 * 1024;
export const PROPERTY_ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

export const validateImageUploadMimeType = (
  mimetype?: string,
  fieldName = "file",
) => {
  if (
    !mimetype ||
    !PROPERTY_ALLOWED_IMAGE_MIME_TYPES.includes(
      mimetype as (typeof PROPERTY_ALLOWED_IMAGE_MIME_TYPES)[number],
    )
  ) {
    throw new BadRequestException(
      `${fieldName} must be a JPG, PNG, WEBP, HEIC, or HEIF image.`,
    );
  }
};

export const createPropertyImageMulterOptions = (): MulterOptions => ({
  limits: {
    files: PROPERTY_UPLOAD_MAX_IMAGES,
    fileSize: PROPERTY_UPLOAD_MAX_FILE_SIZE,
  },
  fileFilter: (_req, file, callback) => {
    try {
      validateImageUploadMimeType(file.mimetype, file.fieldname);
      callback(null, true);
    } catch (error) {
      callback(error as Error, false);
    }
  },
});
