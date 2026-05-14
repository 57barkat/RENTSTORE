import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UserAccountStatus, UserDocument } from "../modules/user/user.entity";
import { UserService } from "../modules/user/user.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async loginWithPassword(emailOrPhone: string, password: string) {
    const trimmedIdentifier = emailOrPhone.trim();
    const isEmailLogin = trimmedIdentifier.includes("@");
    const normalizedIdentifier = isEmailLogin
      ? trimmedIdentifier.toLowerCase()
      : trimmedIdentifier;

    const user = await this.userService.validatePassword(
      normalizedIdentifier,
      password,
    );

    if (!user) throw new UnauthorizedException("Invalid credentials");

    let activeUser: UserDocument = user;

    if (user.isBlocked) {
      throw new UnauthorizedException(
        "Your account has been blocked due to multiple warnings. Please contact support.",
      );
    }

    if (user.accountStatus === UserAccountStatus.SUSPENDED) {
      if (!this.userService.isSelfDeletionPending(user)) {
        throw new UnauthorizedException(
          "Your account is suspended. Please contact support.",
        );
      }

      activeUser = await this.userService.reactivateAccount(user.id);
    }

    if (!activeUser.isEmailVerified) {
      await this.userService.sendEmailVerificationCode(activeUser.email);
      throw new UnauthorizedException({
        message: "VERIFY_EMAIL_REQUIRED",
        email: activeUser.email,
      });
    }

    const tokens = await this.issueTokens(activeUser);
    const role = activeUser.role;
    const userData = {
      name: activeUser.name,
      image: activeUser.profileImage,
      isPhoneVerified: activeUser.isPhoneVerified,
    };

    return { user: activeUser, tokens, role, userData };
  }

  async issueTokens(user: UserDocument) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessExpiresIn =
      this.configService.get<string>("app.jwtExpiresIn", { infer: true }) ||
      "15m";
    const refreshSecret =
      this.configService.get<string>("app.jwtRefreshSecret", { infer: true }) ||
      this.configService.get<string>("app.jwtSecret", { infer: true });
    const refreshExpiresIn =
      this.configService.get<string>("app.jwtRefreshExpiresIn", {
        infer: true,
      }) || "7d";

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: accessExpiresIn,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: refreshExpiresIn,
    });

    await this.userService.update(user.id, {
      refreshToken: await bcrypt.hash(refreshToken, 10),
    });

    return { accessToken, refreshToken };
  }

  async refresh(token: string) {
    try {
      const refreshSecret =
        this.configService.get<string>("app.jwtRefreshSecret", {
          infer: true,
        }) || this.configService.get<string>("app.jwtSecret", { infer: true });
      const payload = this.jwtService.verify(token, {
        secret: refreshSecret,
      });
      const userId = payload.sub;

      const user = await this.userService.findById(userId);
      if (!user || !user.refreshToken) throw new UnauthorizedException();

      if (user.isBlocked) {
        throw new UnauthorizedException(
          "Your account has been blocked due to multiple warnings. Please contact support.",
        );
      }

      if (user.accountStatus === UserAccountStatus.SUSPENDED) {
        throw new UnauthorizedException(
          this.userService.isSelfDeletionPending(user)
            ? "Your account deletion is scheduled. Log in again within 30 days to restore it."
            : "Your account is suspended. Please contact support.",
        );
      }

      const valid = await bcrypt.compare(token, user.refreshToken);
      if (!valid) throw new UnauthorizedException();

      return this.issueTokens(user);
    } catch (e) {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }
  }

  async logout(userId: string) {
    await this.userService.update(userId, { refreshToken: undefined });
  }
}
