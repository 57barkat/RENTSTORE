import { UserRole } from "../user.entity";

export class UpdateUserDto {
  name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  isBlocked?: boolean;
  warnings?: number;
}
