import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export enum ReportReason {
  SCAM = "SCAM",
  SOLD = "RENTED",
  INCORRECT_DATA = "INCORRECT_DATA",
  MISLEADING_PHOTOS = "MISLEADING_PHOTOS",
  OTHER = "OTHER",
}

@Schema({ timestamps: true })
export class PropertyReport extends Document {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  reporterId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Property", required: true })
  propertyId!: Types.ObjectId;

  @Prop({ type: String, enum: ReportReason, required: true })
  reason!: ReportReason;

  @Prop({ type: String })
  description!: string;

  @Prop({
    type: String,
    enum: ["PENDING", "RESOLVED", "REJECTED"],
    default: "PENDING",
  })
  status!: string;
}

export const ReportSchema = SchemaFactory.createForClass(PropertyReport);
