import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  RequestRateLimit,
  RequestRateLimitDocument,
} from "./request-rate-limit.schema";

@Injectable()
export class RequestRateLimitService {
  constructor(
    @InjectModel(RequestRateLimit.name)
    private readonly rateLimitModel: Model<RequestRateLimitDocument>,
  ) {}

  async consume(key: string, windowMs: number) {
    const expiresAt = new Date(Date.now() + windowMs * 2);

    return this.rateLimitModel.findOneAndUpdate(
      { key },
      {
        $inc: { count: 1 },
        $setOnInsert: { expiresAt },
      },
      {
        upsert: true,
        new: true,
      },
    );
  }
}
