import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsBoolean,
} from "class-validator";
import { Type, Transform } from "class-transformer";
import { Property } from "../property.schema";

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

export class CreatePropertyDto {
  @IsOptional() @IsString() _id?: string;
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() hostOption?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() area?: string;

  @Transform(({ value }) => (value ? Number(value) : value))
  @IsOptional()
  @IsNumber()
  lat?: number;

  @Transform(({ value }) => (value ? Number(value) : value))
  @IsOptional()
  @IsNumber()
  lng?: number;

  @IsOptional()
  locationGeo?: { type: string; coordinates: number[] };

  @IsOptional() @IsNumber() monthlyRent?: number;
  @IsOptional() @IsNumber() dailyRent?: number;
  @IsOptional() @IsNumber() weeklyRent?: number;
  @IsOptional() @IsNumber() SecuritybasePrice?: number;

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

  @IsOptional() @IsString() apartmentType?: string;
  @IsOptional() @IsString() furnishing?: string;
  @IsOptional() @IsBoolean() parking?: boolean;

  @IsOptional() @IsString() hostelType?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) mealPlan: string[] = [];
  @IsOptional() @IsArray() @IsString({ each: true }) rules: string[] = [];

  @IsString() ownerId: string;

  @IsOptional() @IsString() addressQuery?: string;
  @IsOptional() @IsString() searchText?: string;
  @IsOptional() @IsString() addressText?: string;

  @Transform(({ value }) => value === "true" || value === true)
  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}

export interface PropertyWithFav extends Property {
  _id: string;
  isFav?: boolean;
}
