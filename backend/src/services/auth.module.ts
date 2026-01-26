import { Module, forwardRef } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { UserModule } from "../modules/user/user.module";
import { JwtStrategy } from "./jwt.strategy";
import { JwtRefreshStrategy } from "./jwt-refresh.strategy";

@Module({
  imports: [
    forwardRef(() => UserModule),
    PassportModule.register({ defaultStrategy: "jwt" }), // important
    JwtModule.register({
      secret: process.env.JWT_SECRET || "suppersecretkey",
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    }),
  ],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy], // include both
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
