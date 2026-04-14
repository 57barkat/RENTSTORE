import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import {
  ExtractJwt,
  Strategy,
  StrategyOptionsWithRequest,
} from "passport-jwt";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        secretOrKey: process.env.JWT_SECRET!,
        passReqToCallback: true,
      } as StrategyOptionsWithRequest,
    );
  }

  async validate(req: Request, payload: any) {
    const token = (req.headers as any).authorization?.split(' ')[1];
    if (!token) throw new UnauthorizedException();
    return { userId: payload.sub, token };
  }
}
