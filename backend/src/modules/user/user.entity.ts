import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type UserDocument = User & Document;

export enum UserRole {
  AGENCY = "agency",
  RENTER = "renter",
  USER = "user",
  ADMIN = "admin",
  AGENT = "agent",
}

export enum UserAccountStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  BANNED = "BANNED",
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: UserRole })
  role: UserRole;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  phone: string;

  @Prop({ type: Types.ObjectId, ref: "Agency" })
  agency?: Types.ObjectId;

  @Prop({ default: 1 })
  propertyLimit: number;

  @Prop({ required: true, unique: true })
  cnic: string;

  @Prop()
  agencyLicense?: string;

  @Prop()
  preferences?: string;

  @Prop({ default: false })
  isPhoneVerified: boolean;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop()
  TermsAndConditionsAccepted: boolean;

  @Prop({ type: String })
  fcmToken?: string;

  @Prop({ type: [String], default: [] })
  subscriptions?: string[];

  @Prop({ type: [{ type: Types.ObjectId, ref: "Property" }], default: [] })
  favorites: Types.ObjectId[];

  @Prop({ type: String })
  refreshToken?: string;

  @Prop({ type: String })
  profileImage?: string;

  @Prop()
  emailVerificationCode?: string;

  @Prop({ default: 0 })
  warnings: number;

  @Prop({ default: false })
  isBlocked: boolean;

  @Prop()
  emailVerificationCodeExpires?: Date;

  @Prop({
    type: String,
    enum: UserAccountStatus,
    default: UserAccountStatus.ACTIVE,
  })
  accountStatus: UserAccountStatus;

  @Prop({ default: 0 })
  strikeCount: number;

  @Prop()
  suspendedAt?: Date;

  @Prop()
  suspensionReason?: string;

  @Prop()
  bannedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
