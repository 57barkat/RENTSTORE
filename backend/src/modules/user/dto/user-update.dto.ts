import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
} from "class-validator";
import {
  SubscriptionType,
  UserAccountStatus,
  UserRole,
} from "../user.entity";

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  isBlocked?: boolean;

  @IsOptional()
  @IsNumber()
  warnings?: number;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  resetPasswordCode?: string;

  @IsOptional()
  @IsDateString()
  resetPasswordCodeExpires?: string;

  @IsOptional()
  @IsBoolean()
  isResetCodeVerified?: boolean;

  @IsOptional()
  @IsMongoId()
  agency?: string;

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
  paidPropertyCredits?: number;

  @IsOptional()
  @IsNumber()
  usedPropertyCount?: number;

  @IsOptional()
  @IsNumber()
  prioritySlotCredits?: number;

  @IsOptional()
  @IsNumber()
  paidFeaturedCredits?: number;

  @IsOptional()
  @IsString()
  cnic?: string;

  @IsOptional()
  @IsString()
  agencyLicense?: string;

  @IsOptional()
  @IsString()
  preferences?: string;

  @IsOptional()
  @IsBoolean()
  isPhoneVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  TermsAndConditionsAccepted?: boolean;

  @IsOptional()
  @IsString()
  fcmToken?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subscriptions?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  favorites?: string[];

  @IsOptional()
  @IsString()
  refreshToken?: string;

  @IsOptional()
  @IsString()
  profileImage?: string;

  @IsOptional()
  @IsString()
  emailVerificationCode?: string;

  @IsOptional()
  @IsDateString()
  emailVerificationCodeExpires?: string;

  @IsOptional()
  @IsEnum(UserAccountStatus)
  accountStatus?: UserAccountStatus;

  @IsOptional()
  @IsNumber()
  strikeCount?: number;

  @IsOptional()
  @IsDateString()
  suspendedAt?: string;

  @IsOptional()
  @IsString()
  suspensionReason?: string;

  @IsOptional()
  @IsDateString()
  bannedAt?: string;
}
