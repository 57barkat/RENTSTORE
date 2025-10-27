import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsObject,
  IsBoolean,
  isString,
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
  @IsOptional() @IsNumber() guests?: number;
  @IsOptional() @IsNumber() bedrooms?: number;
  @IsOptional() @IsNumber() beds?: number;
  @IsOptional() @IsNumber() bathrooms?: number;
}

class SafetyDetailsDataDto {
  @IsOptional() @IsArray() @IsString({ each: true }) safetyDetails?: string[];
  @IsOptional() @IsString() cameraDescription?: string;
}

class DescriptionDto {
  @IsOptional() @IsArray() @IsString({ each: true }) highlighted?: string[];
}

export class CreatePropertyDto {
  @IsOptional() @IsString() _id?: string;
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() hostOption?: string;
  @IsOptional() @IsString() location?: string;

  @IsOptional() @IsNumber() monthlyRent?: number;
  @IsOptional() @IsNumber() SecuritybasePrice?: number;

  @IsOptional() @IsArray() @IsString({ each: true }) ALL_BILLS?: string[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  address?: AddressDto[];

  @IsOptional() @IsArray() @IsString({ each: true }) amenities?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CapacityStateDto)
  capacityState?: CapacityStateDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DescriptionDto)
  description?: DescriptionDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SafetyDetailsDataDto)
  safetyDetailsData?: SafetyDetailsDataDto;

  @IsOptional() @IsArray() @IsString({ each: true }) photos?: string[];

  @IsString() ownerId: string;

  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}

export interface PropertyWithFav extends Property {
  _id: string;
  isFav?: boolean;
}
