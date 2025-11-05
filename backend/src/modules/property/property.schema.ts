import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

// --- Sub-Schema for Rent Rates ---
@Schema()
class RentRate {
  @Prop({ type: String, enum: ["daily", "weekly", "monthly"] })
  type: string; // The type of rent (daily, weekly, monthly)

  @Prop({ type: Number })
  amount: number; // The numeric rent based on the type
}
const RentRateSchema = SchemaFactory.createForClass(RentRate);
// ---------------------------------

@Schema({ timestamps: true })
export class Property extends Document {
  // Basic Info
  @Prop({
    type: String,
    required: function () {
      return this.status;
    },
  })
  title: string;

  @Prop({
    type: String,
    enum: ["house", "apartment", "room", "hostel"],
    required: function () {
      return this.status;
    },
  })
  propertyType: string; // Instead of separate hostelType/roomType

  @Prop({
    type: String,
    enum: ["male", "female", "mixed", "single", "double"],
    required: false,
  })
  subType?: string; // handles both roomType and hostelType // Address (localized for Pakistan)

  @Prop({
    type: {
      city: String, // Karachi, Lahore, Islamabad...
      area: String, // DHA, Bahria, Gulberg...
      block: String, // optional
      street: String,
      fullAddress: String,
    },
    required: function () {
      return this.status;
    },
  })
  location: Record<string, any>; // Rent and Payment (MODIFIED FOR MULTI-RENT)

  @Prop({ type: [RentRateSchema] })
  rentRates: RentRate[];

  @Prop({ type: Number })
  securityDeposit?: number; // Bills included

  @Prop({ type: [String], default: [] })
  billsIncluded?: string[]; // Capacity

  @Prop({
    type: {
      persons: Number,
      bedrooms: Number,
      beds: Number,
      bathrooms: Number,
    },
  })
  capacity?: Record<string, any>; // Features / Amenities

  @Prop({ type: [String], default: [] })
  amenities?: string[]; // Safety / Rules

  @Prop({ type: [String], default: [] })
  safetyFeatures?: string[];

  @Prop({ type: [String], default: [] })
  rules?: string[]; // Description

  @Prop({
    type: {
      highlights: [String],
      details: String,
    },
  })
  description?: Record<string, any>; // Photos

  @Prop({ type: [String], default: [] })
  photos?: string[]; // Owner

  @Prop({ type: String })
  ownerId: string; // Draft or Published

  @Prop({ type: Boolean, default: false })
  status: boolean;
}

export const PropertySchema = SchemaFactory.createForClass(Property);

PropertySchema.index({ propertyType: 1 });
PropertySchema.index({ ownerId: 1 });
