import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import * as bcrypt from "bcrypt";
import { User, UserDocument } from "src/modules/user/user.entity";
import { UserService } from "src/modules/user/user.service";

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    public jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async login(user: UserDocument) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Save hashed refresh token in DB
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userService.update(user.id, { refreshToken: hashedRefreshToken });

    return { accessToken, refreshToken };
  }

  async refresh(userId: string, token: string) {
    const user = await this.userService.findById(userId);
    if (!user || !user.refreshToken) throw new UnauthorizedException();

    const isMatch = await bcrypt.compare(token, user.refreshToken);
    if (!isMatch) throw new UnauthorizedException();

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userService.update(user.id, { refreshToken: hashedRefreshToken });

    return { accessToken, refreshToken };
  }

  async logout(userId: string) {
    return this.userService.update(userId, { refreshToken: undefined });
  }
}
