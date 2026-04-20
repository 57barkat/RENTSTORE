import { Module } from "@nestjs/common";
import { RequestRateLimitService } from "./request-rate-limit.service";

@Module({
  providers: [RequestRateLimitService],
  exports: [RequestRateLimitService],
})
export class RequestRateLimitModule {}
