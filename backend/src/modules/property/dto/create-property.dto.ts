import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsEnum,
  IsDateString,
  Min,
  Max,
  IsNotEmpty,
} from "class-validator";
import { Type, Transform } from "class-transformer";
import { Property, PropertyModerationStatus } from "../property.schema";
import {
  APARTMENT_TYPES,
  FURNISHING_TYPES,
  HOSTEL_TYPES,
  PROPERTY_HOST_OPTIONS,
  PROPERTY_SIZE_UNITS,
} from "../property.constants";

class AddressDto {
  @IsOptional() @IsString() aptSuiteUnit?: string;
  @IsOptional() @IsString() street?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() stateTerritory?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() zipCode?: string;
}

class CapacityStateDto {
  @IsOptional() @IsNumber() Persons: number = 1;
  @IsOptional() @IsNumber() bedrooms: number = 0;
  @IsOptional() @IsNumber() beds: number = 1;
  @IsOptional() @IsNumber() bathrooms: number = 1;
  @IsOptional() @IsNumber() floorLevel?: number;
}

class SafetyDetailsDataDto {
  @IsOptional() @IsArray() @IsString({ each: true }) safetyDetails: string[] =
    [];
  @IsOptional() @IsString() cameraDescription?: string;
}

class DescriptionDto {
  @IsOptional() @IsArray() @IsString({ each: true }) highlighted: string[] = [];
}
class PropertySizeDto {
  @IsNumber()
  @IsNotEmpty()
  value!: number;

  @IsEnum(PROPERTY_SIZE_UNITS, {
    message: "Unit must be one of: Marla, Kanal, Sq. Ft., Sq. Yd.",
  })
  @IsNotEmpty()
  unit!: string;
}
export class CreatePropertyDto {
  @IsOptional() @IsString() _id?: string;
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsEnum(PROPERTY_HOST_OPTIONS) hostOption?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() area?: string;

  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsOptional()
  @IsNumber()
  lat?: number;

  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsOptional()
  @IsNumber()
  lng?: number;

  @IsOptional()
  locationGeo?: {
    type: "Point";
    coordinates: number[];
  };

  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsOptional()
  @IsNumber()
  monthlyRent?: number;

  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsOptional()
  @IsNumber()
  dailyRent?: number;

  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsOptional()
  @IsNumber()
  weeklyRent?: number;

  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsOptional()
  @IsNumber()
  SecuritybasePrice?: number;

  @IsOptional() @IsArray() @IsString({ each: true }) ALL_BILLS: string[] = [];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  address: AddressDto[] = [];

  @IsOptional() @IsArray() @IsString({ each: true }) amenities: string[] = [];
  @IsOptional() @IsArray() @IsString({ each: true }) photos: string[] = [];

  @IsOptional()
  @ValidateNested()
  @Type(() => CapacityStateDto)
  capacityState: CapacityStateDto = new CapacityStateDto();

  @IsOptional()
  @ValidateNested()
  @Type(() => DescriptionDto)
  description: DescriptionDto = new DescriptionDto();

  @IsOptional()
  @ValidateNested()
  @Type(() => SafetyDetailsDataDto)
  safetyDetailsData: SafetyDetailsDataDto = new SafetyDetailsDataDto();

  @IsOptional()
  @IsEnum(APARTMENT_TYPES)
  apartmentType?: string;

  @IsOptional()
  @IsEnum(FURNISHING_TYPES)
  furnishing?: string;

  @Transform(({ value }) => value === "true" || value === true)
  @IsOptional()
  @IsBoolean()
  parking?: boolean;

  @IsOptional()
  @IsEnum(HOSTEL_TYPES)
  hostelType?: string;

  @IsOptional() @IsArray() @IsString({ each: true }) mealPlan: string[] = [];
  @IsOptional() @IsArray() @IsString({ each: true }) rules: string[] = [];

  // --- Relations ---
  @IsString() ownerId!: string;
  @IsOptional() @IsString() agency?: string;
  @IsOptional() @IsString() listedBy?: string;

  // --- Status & Visibility ---
  @Transform(({ value }) => value === "true" || value === true)
  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @Transform(({ value }) => value === "true" || value === true)
  @IsOptional()
  @IsBoolean()
  isApproved?: boolean = false;

  @Transform(({ value }) => value === "true" || value === true)
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean = true;

  @IsOptional()
  @IsEnum(PropertyModerationStatus)
  moderationStatus?: PropertyModerationStatus;

  @IsOptional()
  @ValidateNested()
  @Type(() => PropertySizeDto)
  size?: PropertySizeDto;

  // --- Sorting & Weights (Crucial for the new system) ---
  @Transform(({ value }) => (value !== undefined ? Number(value) : 1))
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(3)
  sortWeight?: number;

  @Transform(({ value }) => value === "true" || value === true)
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsDateString()
  featuredUntil?: string;

  @Transform(({ value }) => value === "true" || value === true)
  @IsOptional()
  @IsBoolean()
  isBoosted?: boolean;

  // --- Statistics ---
  @IsOptional() @IsNumber() reportCount?: number;
  @IsOptional() @IsNumber() strikeCount?: number;

  // --- UI Helpers ---
  @IsOptional() @IsString() addressQuery?: string;
  @IsOptional() @IsString() searchText?: string;
  @IsOptional() @IsString() addressText?: string;
}
export interface PropertyWithFav extends Property {
  _id: string;
  isFav?: boolean;
}
