import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
  IsBoolean,
  IsNotEmpty,
  Matches,
} from "class-validator";
import { Type, Transform } from "class-transformer";
import { UserRole } from "../user.entity";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsNotEmpty()
  // Updated Regex to make dashes optional so 1234567890987 passes
  @Matches(/^[0-9]{5}-?[0-9]{7}-?[0-9]{1}$/, {
    message: "CNIC must be 00000-0000000-0 or 13 digits",
  })
  cnic!: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsBoolean()
  @IsNotEmpty()
  @Type(() => Boolean)
  acceptedTerms!: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @Transform(({ value }) => value === "true" || value === true)
  isAgencyPerson: boolean = false;

  @ValidateIf((o) => o.isAgencyPerson === true)
  @IsString()
  @IsNotEmpty()
  agencyName?: string;

  @ValidateIf((o) => o.isAgencyPerson === true)
  @IsOptional()
  @IsString()
  agencyLogo?: string;

  @ValidateIf((o) => o.isAgencyPerson === true)
  @IsOptional()
  @IsString()
  agencyAddress?: string;

  @IsOptional()
  @IsString()
  agencyLicense?: string;

  @IsOptional()
  @IsString()
  profileImage?: string;

  @IsOptional()
  @IsString()
  preferences?: string;
}
