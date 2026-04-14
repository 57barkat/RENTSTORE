import { SetMetadata } from "@nestjs/common";

export type RateLimitScope = "ip" | "userOrIp" | "user";

export type RateLimitPolicy = {
  limit: number;
  windowMs: number;
  scope?: RateLimitScope;
};

export const RATE_LIMIT_METADATA = "rateLimitPolicy";

export const RateLimit = (policy: RateLimitPolicy) =>
  SetMetadata(RATE_LIMIT_METADATA, policy);
