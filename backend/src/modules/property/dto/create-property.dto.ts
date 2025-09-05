import { IsString, IsNumber, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class CreatePropertyDto {
  @IsString() propertyType: string;
  @IsString() title: string;
  @IsString() description: string;
  @IsString() address: string;
  @IsString() city: string;
  @IsString() area: string;

  @IsOptional() @IsNumber() latitude?: number;
  @IsOptional() @IsNumber() longitude?: number;

  @IsOptional() @IsNumber() bedrooms?: number;
  @IsOptional() @IsNumber() bathrooms?: number;
  @IsOptional() @IsNumber() kitchens?: number;
  @IsOptional() @IsNumber() livingRooms?: number;
  @IsOptional() @IsNumber() balconies?: number;
  @IsOptional() @IsBoolean() furnished?: boolean;
  @IsOptional() @IsNumber() floor?: number;
  @IsOptional() @IsString() totalArea?: string;

  @IsNumber() rentPrice: number;
  @IsOptional() @IsNumber() securityDeposit?: number;
  @IsOptional() @IsNumber() maintenanceCharges?: number;
  @IsOptional() @IsBoolean() utilitiesIncluded?: boolean;

  @IsString() ownerName: string;
  @IsString() phone: string;
  @IsOptional() @IsString() email?: string;

  @IsOptional() @IsArray() images?: string[];
  @IsOptional() @IsArray() videos?: string[];
  @IsOptional() @IsArray() amenities?: string[];
  @IsOptional() @IsArray() preferences?: string[];
}
