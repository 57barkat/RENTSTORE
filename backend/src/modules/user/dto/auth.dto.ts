import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";
import { Transform } from "class-transformer";

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  emailOrPhone!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

export class VerifyEmailDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

export class GoogleAuthDto {
  @IsString()
  @IsNotEmpty()
  access_token!: string;
}

export class UpdateCreditsDto {
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsNumber()
  paidPropertyCredits?: number;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsNumber()
  paidFeaturedCredits?: number;
}
