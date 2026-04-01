import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
  IsBoolean,
} from "class-validator";
import { UserRole } from "../user.entity";

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsBoolean()
  isAgencyPerson: boolean;

  @ValidateIf((o) => o.isAgencyPerson)
  @IsString()
  agencyName?: string;

  @ValidateIf((o) => o.isAgencyPerson)
  @IsOptional()
  @IsString()
  agencyLogo?: string;

  @ValidateIf((o) => o.isAgencyPerson)
  @IsOptional()
  @IsString()
  agencyAddress?: string;

  @IsOptional()
  @IsString()
  agencyLicense?: string;

  @IsOptional()
  @IsString()
  preferences?: string;

  @IsString()
  cnic: string;

  @IsBoolean()
  acceptedTerms: boolean;
}
