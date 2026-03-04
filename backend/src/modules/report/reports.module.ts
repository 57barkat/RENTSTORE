import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PropertyReport, ReportSchema } from "./report.schema";
import { Property, PropertySchema } from "../property/property.schema";
import { ReportsController } from "./reports.controller";
import { ReportsService } from "./reports.service";
import { User, UserSchema } from "../user/user.entity";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PropertyReport.name, schema: ReportSchema },
      { name: Property.name, schema: PropertySchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
