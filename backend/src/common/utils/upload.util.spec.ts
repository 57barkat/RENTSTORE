import { BadRequestException } from "@nestjs/common";
import {
  PROPERTY_ALLOWED_IMAGE_MIME_TYPES,
  validateImageUploadMimeType,
} from "./upload.util";

describe("upload security helpers", () => {
  it("rejects non-image uploads", () => {
    expect(() => validateImageUploadMimeType("application/pdf", "photos")).toThrow(
      new BadRequestException(
        "photos must be a JPG, PNG, WEBP, HEIC, or HEIF image.",
      ),
    );
  });

  it("accepts supported image mimetypes", () => {
    for (const mimetype of PROPERTY_ALLOWED_IMAGE_MIME_TYPES) {
      expect(() => validateImageUploadMimeType(mimetype, "photos")).not.toThrow();
    }
  });
});
