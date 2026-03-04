import {
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";
import { ReportReason } from "../report.schema";

export class CreateReportDto {
  @IsMongoId()
  propertyId: string;

  @IsEnum(ReportReason, {
    message:
      "Reason must be one of: SCAM, SOLD, INCORRECT_DATA, MISLEADING_PHOTOS, or OTHER",
  })
  reason: ReportReason;

  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;
}
