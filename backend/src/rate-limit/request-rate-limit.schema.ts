import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type RequestRateLimitDocument = RequestRateLimit & Document;

@Schema({ timestamps: true })
export class RequestRateLimit {
  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ required: true, default: 0 })
  count: number;

  @Prop({ required: true })
  expiresAt: Date;
}

export const RequestRateLimitSchema =
  SchemaFactory.createForClass(RequestRateLimit);
RequestRateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
