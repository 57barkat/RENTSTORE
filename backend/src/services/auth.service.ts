import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UserDocument } from "../modules/user/user.entity";
import { UserService } from "../modules/user/user.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async loginWithPassword(emailOrPhone: string, password: string) {
    const user = await this.userService.validatePassword(
      emailOrPhone,
      password,
    );
    if (!user) throw new UnauthorizedException("Invalid credentials");

    if (user.isBlocked) {
      throw new UnauthorizedException(
        "Your account has been blocked due to multiple warnings. Please contact support.",
      );
    }
    if (!user.isEmailVerified) {
      await this.userService.sendEmailVerificationCode(user.email);
      throw new UnauthorizedException("VERIFY_EMAIL_REQUIRED");
    }

    const tokens = await this.issueTokens(user);

    return { user, tokens };
  }

  async issueTokens(user: UserDocument) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, { expiresIn: "15m" });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: "7d" });

    await this.userService.update(user.id, {
      refreshToken: await bcrypt.hash(refreshToken, 10),
    });

    return { accessToken, refreshToken };
  }

  async refresh(token: string) {
    console.log("Refreshing token:", token);
    try {
      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      const user = await this.userService.findById(userId);
      if (!user || !user.refreshToken) throw new UnauthorizedException();

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
