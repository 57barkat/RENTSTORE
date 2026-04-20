import { Module, forwardRef } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config"; // Import these
import { AuthService } from "./auth.service";
import { AuthUserCacheService } from "./auth-user-cache.service";
import { UserModule } from "../modules/user/user.module";
import { JwtStrategy } from "./jwt.strategy";
import { JwtRefreshStrategy } from "./jwt-refresh.strategy";

@Module({
  imports: [
    forwardRef(() => UserModule),
    PassportModule.register({ defaultStrategy: "jwt" }),
    // Change .register() to .registerAsync()
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: {
          expiresIn: configService.get<string>("JWT_EXPIRES_IN") || "7d",
        },
      }),
    }),
  ],
  providers: [AuthService, AuthUserCacheService, JwtStrategy, JwtRefreshStrategy],
  exports: [AuthService, AuthUserCacheService, JwtModule],
})
export class AuthModule {}
