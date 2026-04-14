import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RATE_LIMIT_METADATA, RateLimitPolicy } from "src/common/decorators/rate-limit.decorator";
import { RequestRateLimitService } from "./request-rate-limit.service";

const DEFAULT_POLICY: RateLimitPolicy = {
  limit: 300,
  windowMs: 60_000,
  scope: "userOrIp",
};

@Injectable()
export class RequestRateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly requestRateLimitService: RequestRateLimitService,
  ) {}

  async canActivate(context: ExecutionContext) {
    if (context.getType() !== "http") {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const policy =
      this.reflector.getAllAndOverride<RateLimitPolicy>(RATE_LIMIT_METADATA, [
        context.getHandler(),
        context.getClass(),
      ]) ?? DEFAULT_POLICY;

    const controllerName = context.getClass().name;
    const handlerName = context.getHandler().name;
    const actor = this.resolveActor(policy.scope ?? "userOrIp", request);

    if (!actor) {
      return true;
    }

    const windowBucket = Math.floor(Date.now() / policy.windowMs);
    const key = [
      request.method,
      controllerName,
      handlerName,
      policy.scope ?? "userOrIp",
      actor,
      windowBucket,
    ].join(":");

    const record = await this.requestRateLimitService.consume(key, policy.windowMs);

    if ((record?.count ?? 0) > policy.limit) {
      throw new HttpException(
        "Too many requests. Please slow down.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private resolveActor(
    scope: NonNullable<RateLimitPolicy["scope"]>,
    request: any,
  ) {
    const userId = request.user?.userId;
    const forwardedFor = request.headers["x-forwarded-for"];
    const ip =
      request.ip ||
      (typeof forwardedFor === "string"
        ? forwardedFor.split(",")[0]?.trim()
        : Array.isArray(forwardedFor)
          ? forwardedFor[0]
          : undefined) ||
      "unknown";

    if (scope === "user") {
      return userId ?? null;
    }

    if (scope === "ip") {
      return ip;
    }

    return userId ?? ip;
  }
}
