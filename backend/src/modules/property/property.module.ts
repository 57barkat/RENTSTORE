import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PropertyService } from "./property.service";
import { PropertyController } from "./property.controller";
import { Property, PropertySchema } from "./property.schema";
import { CloudinaryModule } from "../../services/Cloudinary Service/cloudinary.module";
import { AuthModule } from "../../services/auth.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Property.name, schema: PropertySchema },
    ]),
    CloudinaryModule,
    AuthModule,
  ],
  controllers: [PropertyController],
  providers: [PropertyService],
  exports: [PropertyService],
})
export class PropertyModule {}
