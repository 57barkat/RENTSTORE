import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./user.entity";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { AuthModule } from "../../services/auth.module";
import { Agency, AgencySchema } from "../Agency/agency.entity";
import { Property, PropertySchema } from "../property/property.schema";
import { EmailModule } from "../../services/email/email.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Agency.name, schema: AgencySchema },
      { name: Property.name, schema: PropertySchema },
    ]),
    forwardRef(() => AuthModule),
    EmailModule,
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
