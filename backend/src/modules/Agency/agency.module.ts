import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AgencyService } from "./agency.service";
import { AgencyController } from "./agency.controller";
import { Agency, AgencySchema } from "./agency.entity";
import { User, UserSchema } from "../user/user.entity";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Agency.name, schema: AgencySchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [AgencyService],
  controllers: [AgencyController],
})
export class AgencyModule {}
