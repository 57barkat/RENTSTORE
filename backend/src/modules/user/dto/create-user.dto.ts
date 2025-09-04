import { IsEmail, IsEnum, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';
import { UserRole } from '../user.entity';

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

  @IsEnum(UserRole)
  role: UserRole;

  @ValidateIf(o => o.role === UserRole.AGENCY)
  @IsString()
  agencyName?: string;

  @IsOptional()
  @IsString()
  agencyLicense?: string;

  @IsOptional()
  @IsString()
  preferences?: string;

  @IsString()
  cnic: string;
}
