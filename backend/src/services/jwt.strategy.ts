import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../modules/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'suppersecretkey',
    });
  }

  async validate(payload: any) {
    if (!payload || !payload.sub) throw new UnauthorizedException();
 
    const user = await this.userService.findById(payload.sub);
    if (!user) throw new UnauthorizedException('User not found');
 
    if (user.isBlocked) { 
      await this.userService.update(user.id, { refreshToken: undefined });
      throw new UnauthorizedException(
        'Your account has been blocked due to multiple warnings.'
      );
    }

    return { userId: user.id, email: user.email, role: user.role };
  }
}

