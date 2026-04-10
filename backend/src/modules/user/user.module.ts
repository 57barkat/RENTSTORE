import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./user.entity";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { AuthModule } from "../../services/auth.module";
import { EmailModule } from "src/services/email/email.module";
import { Agency, AgencySchema } from "../Agency/agency.entity";
import { Property, PropertySchema } from "../property/property.schema";

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
