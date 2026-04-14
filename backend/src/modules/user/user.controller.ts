import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Req,
  UseGuards,
  BadRequestException,
  Patch,
  SetMetadata,
  Param,
  Query,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { UserService } from "./user.service";
import { AuthService } from "../../services/auth.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserResponseDto } from "./dto/user-response.dto";
import { UserDocument } from "./user.entity";
import { UpdateUserDto } from "./dto/user-update.dto";
import { Public } from "src/common/decorators/public.decorator";
import { RateLimit } from "src/common/decorators/rate-limit.decorator";
import {
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyResetCodeDto,
} from "./dto/forgot-password.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
@Controller("users")
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}
  @Public()
  @Post("signup")
  @RateLimit({ limit: 5, windowMs: 15 * 60 * 1000, scope: "ip" })
  async signup(@Body() dto: CreateUserDto) {
    const user = await this.userService.createUser(dto);
    const tokens = await this.authService.issueTokens(user);

    return { ...this.mapUser(user), ...tokens };
  }
  @Public()
  @Post("login")
  @RateLimit({ limit: 10, windowMs: 10 * 60 * 1000, scope: "ip" })
  async login(@Body() body: { emailOrPhone: string; password: string }) {
    const { user, tokens } = await this.authService.loginWithPassword(
      body.emailOrPhone,
      body.password,
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      role: user.role,
      isphoneverified: user.isPhoneVerified,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        propertyLimit: user.propertyLimit,
        paidPropertyCredits: user.paidPropertyCredits,
        usedPropertyCount: user.usedPropertyCount,
        paidFeaturedCredits: user.paidFeaturedCredits,
        subscription: user.subscription,
        subscriptionStartDate: user.subscriptionStartDate,
        subscriptionEndDate: user.subscriptionEndDate,
        subscriptionAutoRenew: user.subscriptionAutoRenew,
        subscriptionTrialUsed: user.subscriptionTrialUsed,
        prioritySlotCredits: user.prioritySlotCredits,
      },
    };
  }

  @Public()
  @Post("forgot-password")
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return await this.userService.requestPasswordReset(dto.email);
  }

  @Public()
  @Post("verify-reset-code")
  async verifyResetCode(@Body() dto: VerifyResetCodeDto) {
    return await this.userService.verifyResetCode(dto.email, dto.code);
  }

  @Public()
  @Post("reset-password")
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return await this.userService.resetPassword(dto);
  }
  @UseGuards(JwtAuthGuard)
  @Get("me")
  async getMe(@Req() req) {
    const userId = req.user.userId || req.user.id || req.user.sub;

    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      isphoneverified: user.isPhoneVerified,
      propertyLimit: user.propertyLimit,
      usedPropertyCount: user.usedPropertyCount,
      paidPropertyCredits: user.paidPropertyCredits,
      paidFeaturedCredits: user.paidFeaturedCredits,
      subscription: user.subscription,
      subscriptionStartDate: user.subscriptionStartDate,
      subscriptionEndDate: user.subscriptionEndDate,
      subscriptionAutoRenew: user.subscriptionAutoRenew,
      subscriptionTrialUsed: user.subscriptionTrialUsed,
      prioritySlotCredits: user.prioritySlotCredits,
    };
  }
  @Public()
  @Post("verify-email")
  @RateLimit({ limit: 10, windowMs: 10 * 60 * 1000, scope: "ip" })
  async verifyEmail(@Body() body: { email: string; code: string }) {
    const user = await this.userService.verifyEmail(body.email, body.code);
    return this.mapUser(user);
  }

  @Public()
  @Post("google")
  @RateLimit({ limit: 10, windowMs: 10 * 60 * 1000, scope: "ip" })
  async google(@Body("access_token") token: string) {
    const user = await this.userService.googleLogin(token);
    return this.authService.issueTokens(user);
  }
  @UseGuards(JwtAuthGuard)
  @Get("upload-status")
  async getUploadStatus(@Req() req) {
    const userId = req.user.userId;
    return this.userService.getPropertyUploadStatus(userId);
  }
  @Get("admin/all")
  @UseGuards(AuthGuard("jwt"))
  @SetMetadata("roles", ["admin"])
  async getAll(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
    @Query("search") search: string = "",
  ) {
    return await this.userService.findAllPaginated(page, limit, search);
  }
  @Public()
  @Post("refresh")
  @RateLimit({ limit: 30, windowMs: 10 * 60 * 1000, scope: "ip" })
  async refresh(@Body("refreshToken") token: string) {
    return await this.authService.refresh(token);
  }
  @UseGuards(AuthGuard("jwt"))
  @Post("logout")
  async logout(@Req() req) {
    await this.userService.clearRefreshToken(req.user.userId);
    return { message: "Logged out successfully" };
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
  @Patch("admin/update/:id")
  @UseGuards(AuthGuard("jwt"))
  @SetMetadata("roles", ["admin"])
  async updateUser(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updatedUser = await this.userService.updateUser(id, updateUserDto);
    return this.mapUser(updatedUser as UserDocument);
  }

  @Delete("admin/delete/:id")
  @UseGuards(AuthGuard("jwt"))
  @SetMetadata("roles", ["admin"])
  async deleteUser(@Param("id") id: string) {
    return await this.userService.deleteUser(id);
  }
  @UseGuards(JwtAuthGuard)
  @Patch("admin/update-credits/:userId")
  async updateCredits(
    @Param("userId") userId: string,
    @Body()
    updateDto: { paidPropertyCredits?: number; paidFeaturedCredits?: number },
    @Req() req: any,
  ) {
    if (req.user.role !== "admin") {
      throw new UnauthorizedException("Only admins can modify credits");
    }

    return await this.userService.updateUserCredits(userId, updateDto);
  }
}
