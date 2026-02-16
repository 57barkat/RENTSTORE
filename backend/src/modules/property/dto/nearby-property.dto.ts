import { IsNumber, IsOptional } from "class-validator";

export class NearbyPropertyDto {
  @IsNumber() lat: number;
  @IsNumber() lng: number;
  @IsOptional() @IsNumber() radiusKm?: number;
}
