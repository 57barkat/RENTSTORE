import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class Property extends Document {
  @Prop({ type: String }) title?: string;
  @Prop({ type: String }) hostOption?: string;
  @Prop({ type: String }) location?: string;
  @Prop({ type: String }) area?: string;

  @Prop({ type: Number }) lat?: number;
  @Prop({ type: Number }) lng?: number;

  @Prop({
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
    _id: false,
  })
  locationGeo: {
    type: string;
    coordinates: number[];
  };

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
        _id: false,
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
      _id: false,
    },
    default: {},
  })
  capacityState?: Record<string, any>;

  @Prop({
    type: { highlighted: { type: [String], default: [] }, _id: false },
    default: {},
  })
  description?: Record<string, any>;

  @Prop({
    type: {
      safetyDetails: { type: [String], default: [] },
      cameraDescription: String,
      _id: false,
    },
    default: {},
  })
  safetyDetailsData?: Record<string, any>;

  @Prop({ type: String, enum: ["studio", "1BHK", "2BHK", "3BHK", "penthouse"] })
  apartmentType?: string;
  @Prop({ type: String, enum: ["furnished", "semi-furnished", "unfurnished"] })
  furnishing?: string;
  @Prop({ type: Boolean }) parking?: boolean;

  @Prop({ type: String, enum: ["male", "female", "mixed"] })
  hostelType?: string;
  @Prop({ type: [String], default: [] }) mealPlan?: string[];
  @Prop({ type: [String], default: [] }) rules?: string[];

  @Prop({ type: String, required: true }) ownerId: string;

  @Prop({ type: Boolean, default: false }) status: boolean;
  @Prop({ type: Boolean, default: false }) featured: boolean;
}

export const PropertySchema = SchemaFactory.createForClass(Property);
PropertySchema.index({ locationGeo: "2dsphere" });
PropertySchema.index({ area: 1 });
PropertySchema.index({ "address.city": 1 });
PropertySchema.index({ hostOption: 1 });
PropertySchema.index({ price: 1 });
PropertySchema.index({ bedrooms: 1 });
PropertySchema.index({ floorLevel: 1 });
