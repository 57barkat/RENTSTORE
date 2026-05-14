import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "../modules/user/user.service";
import { UserAccountStatus } from "../modules/user/user.entity";
import { AuthUserCacheService } from "./auth-user-cache.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    private readonly userService: UserService,
    private readonly authUserCacheService: AuthUserCacheService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>("app.jwtSecret", {
        infer: true,
      }),
    });
  }

  async validate(payload: any) {
    if (!payload || !payload.sub) throw new UnauthorizedException();

    const cachedUser = await this.authUserCacheService.get(payload.sub);
    if (cachedUser) {
      this.assertUserCanUseToken(cachedUser);

      return {
        userId: cachedUser.id,
        email: cachedUser.email,
        role: cachedUser.role,
      };
    }

    const user = await this.userService.findById(payload.sub);
    if (!user) throw new UnauthorizedException("User not found");

    await this.authUserCacheService.set(payload.sub, {
      id: user.id,
      email: user.email,
      role: user.role,
      isBlocked: Boolean(user.isBlocked),
      accountStatus: user.accountStatus,
      suspensionReason: user.suspensionReason,
    });

    if (user.isBlocked) {
      await this.userService.update(user.id, { refreshToken: undefined });
    }

    this.assertUserCanUseToken({
      isBlocked: Boolean(user.isBlocked),
      accountStatus: user.accountStatus,
      suspensionReason: user.suspensionReason,
    });

    return { userId: user.id, email: user.email, role: user.role };
  }

  private assertUserCanUseToken(user: {
    isBlocked: boolean;
    accountStatus?: string;
    suspensionReason?: string;
  }) {
    if (user.isBlocked) {
      throw new UnauthorizedException(
        "Your account has been blocked due to multiple warnings.",
      );
    }

    if (user.accountStatus === UserAccountStatus.SUSPENDED) {
      if (this.userService.isSelfDeletionPending(user)) {
        throw new UnauthorizedException(
          "Your account deletion is scheduled. Log in again within 30 days to restore it.",
        );
      }

      throw new UnauthorizedException(
        "Your account is suspended. Please contact support.",
      );
    }
  }
}
