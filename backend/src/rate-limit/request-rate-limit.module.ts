import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  RequestRateLimit,
  RequestRateLimitSchema,
} from "./request-rate-limit.schema";
import { RequestRateLimitService } from "./request-rate-limit.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RequestRateLimit.name, schema: RequestRateLimitSchema },
    ]),
  ],
  providers: [RequestRateLimitService],
  exports: [RequestRateLimitService],
})
export class RequestRateLimitModule {}
