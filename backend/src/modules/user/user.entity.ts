import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type UserDocument = User & Document;

export enum UserRole {
  AGENCY = "agency",
  RENTER = "renter",
  USER = "user",
  ADMIN = "admin",
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

  @Prop()
  emailVerificationCodeExpires?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
