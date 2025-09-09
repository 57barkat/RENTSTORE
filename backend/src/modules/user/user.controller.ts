import {
  Body,
  Controller,
  Get,
  Post,
  BadRequestException,
  UnauthorizedException,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserResponseDto } from "./dto/user-response.dto";
import { UserDocument } from "./user.entity";
import { AuthService } from "src/services/auth.service";

@Controller("users")
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) {}

  @Post("signup")
  async signup(
    @Body() createUserDto: CreateUserDto
  ): Promise<UserResponseDto & { accessToken: string }> {
    // console.log(`Signup request received: ${JSON.stringify(createUserDto)}`);
    const user = await this.userService.create(createUserDto);

    if (typeof user === "string") {
      switch (user) {
        case "EMAIL_EXISTS":
          throw new BadRequestException(
            "A user with this email already exists."
          );
        case "PHONE_EXISTS":
          throw new BadRequestException(
            "A user with this phone number already exists."
          );
        case "CNIC_EXISTS":
          throw new BadRequestException(
            "A user with this CNIC already exists."
          );
        case "AGENCY_EXISTS":
          throw new BadRequestException(
            "An agency with this name already exists."
          );
        default:
          throw new BadRequestException(
            "Unknown error occurred during signup."
          );
      }
    }

    const doc = user as UserDocument;

    const { accessToken } = await this.authService.login(doc);

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
      createdAt: doc["createdAt"],
      updatedAt: doc["updatedAt"],
      accessToken,
    };
  }
  @Post("login")
  async login(
    @Body()
    body: {
      emailOrPhone?: string;
      email?: string;
      phone?: string;
      password: string;
    }
  ): Promise<UserResponseDto & { accessToken: string }> {
    // console.log(`Login request received: ${JSON.stringify(body)}`);

    const emailOrPhone = body.emailOrPhone || body.email || body.phone;
    const { password } = body;

    if (!emailOrPhone) {
      throw new BadRequestException("Email or phone is required.");
    }

    const user = await this.userService.validateUser(emailOrPhone, password);
    // console.log("Validated user:", user);

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const { accessToken } = await this.authService.login(user);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      cnic: user.cnic,
      agencyName: user.agencyName,
      agencyLicense: user.agencyLicense,
      preferences: user.preferences,
      isPhoneVerified: user.isPhoneVerified,
      createdAt: user["createdAt"],
      updatedAt: user["updatedAt"],
      accessToken,
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
      createdAt: doc["createdAt"],
      updatedAt: doc["updatedAt"],
    }));
  }
}
