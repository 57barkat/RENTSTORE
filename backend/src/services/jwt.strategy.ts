import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor() {
    console.log("================ Auth JWT")
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "suppersecretkey",
    });
  }

  async validate(payload: any) {
    console.log("Raw JWT payload:", payload);
    if (!payload || !payload.sub || !payload.email) {
      console.error("Invalid JWT payload:", payload);
      throw new UnauthorizedException(
        "Invalid token payload: " + JSON.stringify(payload)
      );
    }
    console.log("JWT payload received:", payload);
    return {
      userId: payload.sub,
    };
  }
}
