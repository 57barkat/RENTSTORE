import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";
import { Transform } from "class-transformer";

export class CreateRoomDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @IsMongoId({ each: true })
  participants!: string[];

  @IsOptional()
  @IsMongoId()
  propertyId?: string;
}

export interface ChatRoomType {
  _id: string;
  participants: string[];
  propertyId?: string;
  isGroup: boolean;
  lastMessage?: string;
  updatedAt?: Date;
}

export class SendMessageDto {
  @IsMongoId()
  chatRoomId!: string;

  @IsString()
  @MaxLength(4000)
  text!: string;
}

export class GetMessagesQueryDto {
  @IsOptional()
  @IsString()
  before?: string;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsInt()
  @Min(1)
  limit?: number;
}
