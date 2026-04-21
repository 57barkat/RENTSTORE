import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "../modules/user/user.service";
import { AuthUserCacheService } from "./auth-user-cache.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    private readonly userService: UserService,
    private readonly authUserCacheService: AuthUserCacheService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  async validate(payload: any) {
    if (!payload || !payload.sub) throw new UnauthorizedException();

    const cachedUser = await this.authUserCacheService.get(payload.sub);
    if (cachedUser) {
      if (cachedUser.isBlocked) {
        throw new UnauthorizedException(
          "Your account has been blocked due to multiple warnings.",
        );
      }

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
    });

    if (user.isBlocked) {
      await this.userService.update(user.id, { refreshToken: undefined });
      throw new UnauthorizedException(
        "Your account has been blocked due to multiple warnings.",
      );
    }

    return { userId: user.id, email: user.email, role: user.role };
  }
}
