import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PropertyService } from "./property.service";
import { PropertyViewTrackerService } from "./property-view-tracker.service";
import { PropertyImpressionTrackerService } from "./property-impression-tracker.service";
import { PropertyController } from "./property.controller";
import { Property, PropertySchema } from "./property.schema";
import { CloudinaryModule } from "../../services/Cloudinary Service/cloudinary.module";
import { AuthModule } from "../../services/auth.module";
import { AddToFavModule } from "../addToFav/favorite.module";
import { PropertyDraftSchema } from "./draft.schema";
import { DeletedImagesModule } from "../../deletedImages/deletedImages.module";
import { UserModule } from "../user/user.module";
import { User, UserSchema } from "../user/user.entity";
import { SubscriptionCleanupService } from "./cronjobs/property.cron";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Property.name, schema: PropertySchema },
      { name: "PropertyDraft", schema: PropertyDraftSchema },
      { name: User.name, schema: UserSchema },
    ]),
    CloudinaryModule,
    AuthModule,
    AddToFavModule,
    DeletedImagesModule,
    UserModule,
  ],
  controllers: [PropertyController],
  providers: [
    PropertyService,
    PropertyViewTrackerService,
    PropertyImpressionTrackerService,
    SubscriptionCleanupService,
  ],
  exports: [PropertyService],
})
export class PropertyModule {}
