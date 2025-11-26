import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'suppersecretkey',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const token = (req.headers as any).authorization?.split(' ')[1];
    if (!token) throw new UnauthorizedException();
    return { userId: payload.sub, token };
  }
}
