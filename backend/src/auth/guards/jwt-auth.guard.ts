import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>("isPublic", [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    const frontendSecret = request.headers["x-frontend-secret"];

    // 1. Logic for PUBLIC routes
    if (isPublic) {
      let hasValidUser = false;

      // Try to validate the Bearer Token if it exists
      if (authHeader) {
        try {
          const result = await super.canActivate(context);
          if (result) hasValidUser = true;
        } catch (e) {
          // Token was invalid/expired, but we don't crash yet because it's public
        }
      }

      // Check the Frontend Secret
      const hasValidSecret = frontendSecret === process.env.MY_APP_SECRET;

      // PASS if they have a valid token OR a valid secret
      if (hasValidUser || hasValidSecret) {
        return true;
      }

      // FAIL if they have neither
      throw new UnauthorizedException("Invalid Secret or Token required");
    }

    // 2. Logic for PRIVATE routes
    return super.canActivate(context) as Promise<boolean>;
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>("isPublic", [
      context.getHandler(),
      context.getClass(),
    ]);

    // If there's an error or no user:
    if (err || !user) {
      // If the route is private, throw the error
      if (!isPublic) {
        throw err || new UnauthorizedException();
      }
      // If the route is public, just return null (Guest mode)
      return null;
    }

    return user;
  }
}
