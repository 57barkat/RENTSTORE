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

    if (context.getType() !== "http") {
      return super.canActivate(context) as Promise<boolean>;
    }

    if (isPublic) {
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers.authorization;

      if (!authHeader) {
        return true;
      }

      try {
        return (await super.canActivate(context)) as boolean;
      } catch {
        return true;
      }
    }

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
