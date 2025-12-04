import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { DeletedImage, DeletedImageSchema } from "./deletedImage.schema";
import { DeletedImagesService } from "./deletedImages.service";
import { DeletedImagesCron } from "./deletedImages.cron";
import { CloudinaryService } from "src/services/Cloudinary Service/cloudinary.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeletedImage.name, schema: DeletedImageSchema },
    ]),
  ],
  providers: [DeletedImagesService, DeletedImagesCron, CloudinaryService],
  exports: [DeletedImagesService],
})
export class DeletedImagesModule {}
