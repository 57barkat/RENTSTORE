import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PropertyService } from "./property.service";
import { PropertyController } from "./property.controller";
import { Property, PropertySchema } from "./property.schema";
import { CloudinaryModule } from "../../services/Cloudinary Service/cloudinary.module";
import { AuthModule } from "../../services/auth.module";
import { AddToFavModule } from "../addToFav/favorite.module";
import { PropertyDraftSchema } from "./draft.schema";
import { DeletedImagesModule } from "src/deletedImages/deletedImages.module";
// import { DeletedImagesModule } from "../deletedImages/deletedImages.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Property.name, schema: PropertySchema },
      { name: "PropertyDraft", schema: PropertyDraftSchema },
    ]),
    CloudinaryModule,
    AuthModule,
    AddToFavModule,
    DeletedImagesModule,
  ],
  controllers: [PropertyController],
  providers: [PropertyService],
  exports: [PropertyService],
})
export class PropertyModule {}
