import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import {
  ExtractJwt,
  Strategy,
  StrategyOptionsWithRequest,
} from "passport-jwt";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(configService: ConfigService) {
    super(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        secretOrKey:
          configService.get<string>("app.jwtRefreshSecret", {
            infer: true,
          }) || configService.getOrThrow<string>("app.jwtSecret", { infer: true }),
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
