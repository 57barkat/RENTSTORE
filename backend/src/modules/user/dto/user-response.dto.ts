import { UserRole } from '../user.entity';

export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  agencyName?: string;
  agencyLicense?: string;
  preferences?: string;
  createdAt: Date;
  updatedAt: Date;
  cnic: string;
  isPhoneVerified: boolean;
}
