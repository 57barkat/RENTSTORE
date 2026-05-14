import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export enum ReportReason {
  FAKE_PROPERTY = "fake_property",
  WRONG_PRICE = "wrong_price",
  WRONG_LOCATION = "wrong_location",
  UNAVAILABLE = "already_rented_unavailable",
  DUPLICATE_LISTING = "duplicate_listing",
  MISLEADING_PHOTOS = "misleading_photos",
  SUSPICIOUS_OWNER_AGENT = "suspicious_owner_agent",
  OFFENSIVE_OR_ILLEGAL = "offensive_or_illegal_content",
  OTHER = "other",
}

export enum ReportStatus {
  PENDING = "pending",
  REVIEWED = "reviewed",
  DISMISSED = "dismissed",
  REMOVED = "removed",
}

@Schema({ timestamps: true })
export class PropertyReport extends Document {
  @Prop({ type: Types.ObjectId, ref: "Property", required: true })
  propertyId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
  reporterUserId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
  listingOwnerId!: Types.ObjectId;

  @Prop({ type: String, enum: ReportReason, required: true })
  reportReason!: ReportReason;

  @Prop({ type: String, trim: true, maxlength: 2000 })
  details?: string;

  @Prop({
    type: String,
    enum: ReportStatus,
    default: ReportStatus.PENDING,
    index: true,
  })
  status!: ReportStatus;

  @Prop({ type: String, trim: true, maxlength: 2000 })
  adminNotes?: string;

  @Prop({ type: Date })
  reviewedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: "User" })
  reviewedByAdminId?: Types.ObjectId;

  @Prop({ type: String, trim: true, maxlength: 250 })
  actionTaken?: string;

  @Prop({ type: Types.ObjectId, ref: "User" })
  reporterId?: Types.ObjectId;

  @Prop({ type: String, enum: ReportReason })
  reason?: ReportReason;

  @Prop({ type: String, trim: true, maxlength: 2000 })
  description?: string;

  @Prop({ type: Date, index: true })
  undoExpiresAt?: Date;
}

export const ReportSchema = SchemaFactory.createForClass(PropertyReport);

ReportSchema.index({ propertyId: 1, status: 1, createdAt: -1 });
ReportSchema.index({ propertyId: 1, reporterUserId: 1, createdAt: -1 });
