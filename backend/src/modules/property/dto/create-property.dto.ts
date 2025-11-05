import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsBoolean,
  ValidateNested,
  IsIn,
  ArrayNotEmpty,
} from "class-validator";
import { Type, Transform } from "class-transformer";
import { Property } from "../property.schema";

// --- Address ---
export class AddressDto {
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() area?: string;
  @IsOptional() @IsString() block?: string;
  @IsOptional() @IsString() street?: string;
  @IsOptional() @IsString() fullAddress?: string;
}

// --- Capacity ---
export class CapacityDto {
  @IsOptional() @IsNumber() persons?: number;
  @IsOptional() @IsNumber() bedrooms?: number;
  @IsOptional() @IsNumber() beds?: number;
  @IsOptional() @IsNumber() bathrooms?: number;
}

// --- Description ---
export class DescriptionDto {
  @IsOptional() @IsArray() @IsString({ each: true }) highlights?: string[];
  @IsOptional() @IsString() details?: string;
}

// --- Rent Rate ---
export class RentRateDto {
  @IsString()
  @IsIn(["daily", "weekly", "monthly"])
  type: "daily" | "weekly" | "monthly";

  @IsNumber()
  amount: number;
}

// --- Main Create DTO ---
export class CreatePropertyDto {
  @IsOptional() @IsString() _id?: string;
  @IsOptional() @IsString() title?: string;

  @IsOptional()
  @IsString()
  @IsIn(["house", "apartment", "room", "hostel"])
  propertyType?: "house" | "apartment" | "room" | "hostel";

  @IsOptional()
  @IsString()
  @IsIn(["male", "female", "mixed", "single", "double"])
  subType?: "male" | "female" | "mixed" | "single" | "double";

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  location?: AddressDto;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => RentRateDto)
  rentRates: RentRateDto[];

  @IsOptional() @IsNumber() securityDeposit?: number;
  @IsOptional() @IsArray() @IsString({ each: true }) billsIncluded?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CapacityDto)
  capacity?: CapacityDto;

  @IsOptional() @IsArray() @IsString({ each: true }) amenities?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) safetyFeatures?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) rules?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => DescriptionDto)
  description?: DescriptionDto;

  @IsOptional() @IsArray() @IsString({ each: true }) photos?: string[];
  @IsString() ownerId: string;

  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}

// --- Type for returning with favorite ---
export interface PropertyWithFav extends Property {
  _id: string;
  isFav?: boolean;
}

// --- Rent filter for search ---
export type RentFilter = {
  minAmount?: number; 
  maxAmount?: number;
  rentType?: "daily" | "weekly" | "monthly";
};
