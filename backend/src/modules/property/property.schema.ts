import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class Property extends Document {
  @Prop({ type: String }) title?: string;
  @Prop({ type: String }) hostOption?: string;

  @Prop({ type: String }) location?: string; // human-readable
  @Prop({ type: Number }) lat?: number;      // latitude
  @Prop({ type: Number }) lng?: number;      // longitude

  @Prop({ type: Number }) monthlyRent?: number;
  @Prop({ type: Number }) dailyRent?: number;
  @Prop({ type: Number }) weeklyRent?: number;
  @Prop({ type: Number }) SecuritybasePrice?: number;

  @Prop({ type: [String], default: [] }) ALL_BILLS?: string[];
  @Prop({
    type: [
      {
        aptSuiteUnit: String,
        street: String,
        city: String,
        stateTerritory: String,
        country: String,
        zipCode: String,
      },
    ],
    default: [],
  })
  address?: Record<string, any>[];

  @Prop({ type: [String], default: [] }) amenities?: string[];
  @Prop({ type: [String], default: [] }) photos?: string[];

  @Prop({
    type: {
      Persons: Number,
      bedrooms: Number,
      beds: Number,
      bathrooms: Number,
      floorLevel: Number,
    },
    default: {},
  })
  capacityState?: Record<string, any>;

  @Prop({
    type: { highlighted: [String] },
    default: {},
  })
  description?: Record<string, any>;

  @Prop({
    type: {
      safetyDetails: [String],
      cameraDescription: String,
    },
    default: {},
  })
  safetyDetailsData?: Record<string, any>;

  @Prop({ type: String, enum: ["studio", "1BHK", "2BHK", "3BHK", "penthouse"] })
  apartmentType?: string;
  @Prop({ type: String, enum: ["furnished", "semi-furnished", "unfurnished"] })
  furnishing?: string;
  @Prop({ type: Boolean }) parking?: boolean;

  @Prop({ type: String, enum: ["male", "female", "mixed"] }) hostelType?: string;
  @Prop({ type: [String], default: [] }) mealPlan?: string[];
  @Prop({ type: [String], default: [] }) rules?: string[];

  @Prop({ type: String, required: true }) ownerId: string;

  @Prop({ type: Boolean, default: false }) status: boolean; // draft vs complete
}

export const PropertySchema = SchemaFactory.createForClass(Property);
