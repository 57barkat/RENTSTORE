import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Property } from '../property.schema';

class AddressDto {
  @IsOptional() @IsString() aptSuiteUnit?: string;
  @IsString() street: string;
  @IsString() city: string;
  @IsString() stateTerritory: string;
  @IsString() country: string;
  @IsString() zipCode: string;
}

class CapacityStateDto {
  @IsNumber() guests: number;
  @IsNumber() bedrooms: number;
  @IsNumber() beds: number;
  @IsNumber() bathrooms: number;
}

class SafetyDetailsDataDto {
  @IsArray() @IsString({ each: true }) safetyDetails: string[];
  @IsOptional() @IsString() cameraDescription?: string;
}

class DescriptionDto {
  @IsOptional() @IsArray() @IsString({ each: true }) highlighted?: string[];
}

export class CreatePropertyDto {
  @IsString() title: string;
  @IsString() hostOption: string;
  @IsString() location: string;

  @IsNumber() monthlyRent: number;
  @IsNumber() SecuritybasePrice: number;

  @IsOptional() @IsArray() @IsString({ each: true }) ALL_BILLS?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  address: AddressDto[];

  @IsOptional() @IsArray() @IsString({ each: true }) amenities?: string[];

  @IsObject()
  @ValidateNested()
  @Type(() => CapacityStateDto)
  capacityState: CapacityStateDto;

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
}

export interface PropertyWithFav extends Property {
  _id: string;
  isFav?: boolean;
}
