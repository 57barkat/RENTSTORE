import { Body, Controller, Get, Post, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserDocument } from './user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    console.log(`Signup request received: ${JSON.stringify(createUserDto)}`);
    const user = await this.userService.create(createUserDto);

    if (typeof user === 'string') {
      switch (user) {
        case 'EMAIL_EXISTS':
          throw new BadRequestException('A user with this email already exists.');
        case 'PHONE_EXISTS':
          throw new BadRequestException('A user with this phone number already exists.');
        case 'CNIC_EXISTS':
          throw new BadRequestException('A user with this CNIC already exists.');
        case 'AGENCY_EXISTS':
          throw new BadRequestException('An agency with this name already exists.');
        default:
          throw new BadRequestException('Unknown error occurred during signup.');
      }
    }

    const doc = user as UserDocument;
    return {
      id: doc.id,
      name: doc.name,
      email: doc.email,
      phone: doc.phone,
      role: doc.role,
      cnic: doc.cnic,
      agencyName: doc.agencyName,
      agencyLicense: doc.agencyLicense,
      preferences: doc.preferences,
      isPhoneVerified: doc.isPhoneVerified,
      createdAt: doc['createdAt'],
      updatedAt: doc['updatedAt'],
    };
  }

  @Get()
  async getAll(): Promise<UserResponseDto[]> {
    const users = await this.userService.findAll();
    return users.map((doc: UserDocument) => ({
      id: doc.id,
      name: doc.name,
      email: doc.email,
      phone: doc.phone,
      role: doc.role,
      cnic: doc.cnic,
      agencyName: doc.agencyName,
      agencyLicense: doc.agencyLicense,
      preferences: doc.preferences,
      isPhoneVerified: doc.isPhoneVerified,
      createdAt: doc['createdAt'],
      updatedAt: doc['updatedAt'],
    }));
  }
}
