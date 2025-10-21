import { AuthGuard } from "@nestjs/passport";
//ignore TS errors for now
// @ts-nocheck
import {
  Body,
  Controller,
  Get,
  Post,
  BadRequestException,
  UnauthorizedException,
  Delete,
  Param,
  Req,
  UseGuards,
  Put,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserResponseDto } from "./dto/user-response.dto";
import { UserDocument } from "./user.entity";
import { AuthService } from "src/services/auth.service";
import { find } from "rxjs";

@Controller("users")
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) {}
  @Post("google")
  async googleLogin(@Body("access_token") accessToken: string) {
    return this.userService.googleLogin(accessToken);
  }
  @Post("signup")
  async signup(
    @Body() createUserDto: CreateUserDto
  ): Promise<UserResponseDto & { accessToken: string }> {
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
      agencyLicense: doc.agencyLicense,
      preferences: doc.preferences,
      isPhoneVerified: doc.isPhoneVerified,
      TermsAndConditionsAccepted: doc.TermsAndConditionsAccepted,
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
    const emailOrPhone = body.emailOrPhone || body.email || body.phone;
    const { password } = body;

    if (!emailOrPhone) {
      throw new BadRequestException("Email or phone is required.");
    }

    const user = await this.userService.validateUser(emailOrPhone, password);

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
      agencyLicense: user.agencyLicense,
      preferences: user.preferences,
      isPhoneVerified: user.isPhoneVerified,
      TermsAndConditionsAccepted: user.TermsAndConditionsAccepted,
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
      agencyLicense: doc.agencyLicense,
      preferences: doc.preferences,
      isPhoneVerified: doc.isPhoneVerified,
      TermsAndConditionsAccepted: doc.TermsAndConditionsAccepted,
      createdAt: doc["createdAt"],
      updatedAt: doc["updatedAt"],
    }));
  }

  @UseGuards(AuthGuard("jwt"))
  @Delete("delete")
  async deleteSelf(@Req() req): Promise<UserResponseDto> {
    const userId = req.user.userId;
    console.log("User ID to delete:", userId);

    const deletedUser = await this.userService.findByIdAndDelete(userId);

    if (!deletedUser) {
      throw new BadRequestException("User not found or already deleted.");
    }

    return {
      id: userId,
      name: deletedUser.name,
      email: deletedUser.email,
      phone: deletedUser.phone,
      role: deletedUser.role,
      cnic: deletedUser.cnic,
      agencyLicense: deletedUser.agencyLicense,
      preferences: deletedUser.preferences,
      isPhoneVerified: deletedUser.isPhoneVerified,
      TermsAndConditionsAccepted: deletedUser.TermsAndConditionsAccepted,
      createdAt: deletedUser["createdAt"],
      updatedAt: deletedUser["updatedAt"],
    };
  }
  @UseGuards(AuthGuard("jwt"))
  @Put("verify-phone")
  async isVerified(@Req() req): Promise<UserResponseDto> {
    const userId = req.user.userId;

    const user = await this.userService.findById(userId);
    if (!user) {
      throw new BadRequestException("User not found.");
    }

    await this.userService.update(user.id, { isPhoneVerified: true });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      cnic: user.cnic,
      agencyLicense: user.agencyLicense,
      preferences: user.preferences,
      isPhoneVerified: true,
      TermsAndConditionsAccepted: user.TermsAndConditionsAccepted,
      createdAt: user["createdAt"],
      updatedAt: new Date(),
    };
  }

  // @Delete("delete/:id")
  // async deleteUser(@Param("id") userId: string): Promise<UserResponseDto> {
  //   return this.userService.findByIdAndDelete(userId);
  // }
}
