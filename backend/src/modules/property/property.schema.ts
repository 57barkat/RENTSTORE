import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class Property extends Document {
  @Prop({
    type: String,
    required: function () {
      return this.status === true;
    },
  })
  title: string;

  @Prop({
    type: String,
    required: function () {
      return this.status === true;
    },
  })
  hostOption: string;

  @Prop({
    type: String,
    required: function () {
      return this.status === true;
    },
  })
  location: string;

  @Prop({
    type: Number,
    required: function () {
      return this.status === true;
    },
  })
  monthlyRent: number;

  @Prop({
    type: Number,
    required: function () {
      return this.status === true;
    },
  })
  SecuritybasePrice: number;

  @Prop({ type: [String], default: [] })
  ALL_BILLS?: string[];

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
    required: function () {
      return this.status === true;
    },
  })
  address: Record<string, any>[];

  @Prop({ type: [String], default: [] })
  amenities?: string[];

  @Prop({
    type: {
      guests: Number,
      bedrooms: Number,
      beds: Number,
      bathrooms: Number,
    },
    required: function () {
      return this.status === true;
    },
  })
  capacityState: Record<string, any>;

  @Prop({
    type: {
      highlighted: [String],
    },
  })
  description?: Record<string, any>;

  @Prop({
    type: {
      safetyDetails: [String],
      cameraDescription: String,
    },
  })
  safetyDetailsData?: Record<string, any>;

  @Prop({ type: [String], default: [] })
  photos?: string[];

  @Prop({ type: String, required: true })
  ownerId: string;

  // 👇 Automatically handles draft vs complete
  @Prop({ type: Boolean, default: false })
  status: boolean;
}

export const PropertySchema = SchemaFactory.createForClass(Property);
