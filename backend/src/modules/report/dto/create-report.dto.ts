import {
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class CreateReportDto {
  @IsOptional()
  @IsMongoId()
  propertyId?: string;

  @IsOptional()
  @IsMongoId()
  listingId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  reportReason?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  reason?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  details?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
