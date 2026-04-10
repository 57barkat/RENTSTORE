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
  IsNumber,
  IsDateString,
} from "class-validator";
import { UserRole, SubscriptionType } from "../user.entity";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{5}-[0-9]{7}-[0-9]{1}$/, {
    message: "CNIC must be 00000-0000000-0",
  })
  cnic: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsBoolean()
  @IsNotEmpty()
  acceptedTerms: boolean;

  @IsOptional()
  @IsEnum(SubscriptionType)
  subscription?: SubscriptionType;

  @IsOptional()
  @IsDateString()
  subscriptionStartDate?: string;

  @IsOptional()
  @IsDateString()
  subscriptionEndDate?: string;

  @IsOptional()
  @IsBoolean()
  subscriptionAutoRenew?: boolean;

  @IsOptional()
  @IsBoolean()
  subscriptionTrialUsed?: boolean;

  @IsOptional()
  @IsNumber()
  propertyLimit?: number;

  @IsOptional()
  @IsNumber()
  usedPropertyCount?: number;

  @IsOptional()
  @IsNumber()
  paidPropertyCredits?: number;

  @IsOptional()
  @IsNumber()
  paidFeaturedCredits?: number;

  @IsOptional()
  @IsNumber()
  prioritySlotCredits?: number;

  @IsBoolean()
  isAgencyPerson: boolean;

  @ValidateIf((o) => o.isAgencyPerson === true)
  @IsString()
  @IsNotEmpty()
  agencyName?: string;

  @ValidateIf((o) => o.isAgencyPerson === true)
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
  profileImage?: string;

  @IsOptional()
  @IsString()
  preferences?: string;
}
