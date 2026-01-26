import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ProfileService } from "./profile.service";
import { ProfileController } from "./profile.controller";
import { User, UserSchema } from "../modules/user/user.entity";
import { Property, PropertySchema } from "../modules/property/property.schema";
import { AddToFav, AddToFavSchema } from "../modules/addToFav/favorite.entity";
import { AuthModule } from "../services/auth.module";
import { CloudinaryModule } from "../services/Cloudinary Service/cloudinary.module";
import { AddToFavModule } from "../modules/addToFav/favorite.module";
import { DeletedImagesModule } from "../deletedImages/deletedImages.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Property.name, schema: PropertySchema },
      { name: AddToFav.name, schema: AddToFavSchema },
    ]),
    forwardRef(() => AuthModule),
    CloudinaryModule,
    AddToFavModule,
    DeletedImagesModule,
  ],
  providers: [ProfileService],
  controllers: [ProfileController],
  exports: [ProfileService],
})
export class ProfileModule {}
