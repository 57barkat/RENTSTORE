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

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>("isPublic", [
      context.getHandler(),
      context.getClass(),
    ]);

    // If it's a public route, don't just return true immediately.
    // Check if the request is coming from your authorized frontend.
    if (isPublic) {
      const request = context.switchToHttp().getRequest();
      const frontendSecret = request.headers["x-frontend-secret"];
      console.log("Incoming Secret:", frontendSecret);
      console.log("Expected Secret:", process.env.MY_APP_SECRET);
      // Compare with the secret stored in your .env file
      if (frontendSecret === process.env.MY_APP_SECRET) {
        return true;
      }
      try {
        return super.canActivate(context) as boolean;
      } catch (e) {
        throw new UnauthorizedException("Invalid Secret or Token");
      }
    }

    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // This allows the @GetUser() decorator to work even if no user is found
    if (err || !user) {
      return null;
    }
    return user;
  }
}
