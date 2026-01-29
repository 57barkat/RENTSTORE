import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Req,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { UserService } from "./user.service";
import { AuthService } from "../../services/auth.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserResponseDto } from "./dto/user-response.dto";
import { UserDocument } from "./user.entity";

@Controller("users")
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post("signup")
  async signup(@Body() dto: CreateUserDto) {
    const user = await this.userService.createUser(dto);
    const tokens = await this.authService.issueTokens(user);

    return { ...this.mapUser(user), ...tokens };
  }

  @Post("login")
  async login(@Body() body: { emailOrPhone: string; password: string }) {
    const { user, tokens } = await this.authService.loginWithPassword(
      body.emailOrPhone,
      body.password,
    );

    return { ...this.mapUser(user), ...tokens };
  }

  @Post("verify-email")
  async verifyEmail(@Body() body: { email: string; code: string }) {
    const user = await this.userService.verifyEmail(body.email, body.code);
    return this.mapUser(user);
  }

  @Post("google")
  async google(@Body("access_token") token: string) {
    const user = await this.userService.googleLogin(token);
    return this.authService.issueTokens(user);
  }

  @Get()
  async getAll(): Promise<UserResponseDto[]> {
    return (await this.userService.findAll()).map(this.mapUser);
  }
  // modules/user/user.controller.ts

  @Post("refresh")
  async refresh(@Body("refreshToken") token: string) {
    return await this.authService.refresh(token);
  }
  @UseGuards(AuthGuard("jwt"))
  @Delete("delete")
  async delete(@Req() req) {
    const user = await this.userService.delete(req.user.sub);
    if (!user) throw new BadRequestException("User not found");
    return this.mapUser(user as UserDocument);
  }

  private mapUser(user: UserDocument): UserResponseDto {
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
    };
  }
}
