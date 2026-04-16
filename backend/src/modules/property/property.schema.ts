import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type PropertyDocument = Property & Document;

export enum PropertyModerationStatus {
  ACTIVE = "ACTIVE",
  UNDER_REVIEW = "UNDER_REVIEW",
  SUSPENDED = "SUSPENDED",
  DELETED = "DELETED",
}

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
  locationGeo!: {
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

  @Prop({
    type: String,
    enum: ["studio", "1BHK", "2BHK", "3BHK", "penthouse"],
  })
  apartmentType?: string;

  @Prop({
    type: String,
    enum: ["furnished", "semi-furnished", "unfurnished"],
  })
  furnishing?: string;

  @Prop({ type: Boolean }) parking?: boolean;

  @Prop({
    type: {
      value: Number,
      unit: { type: String, enum: ["Marla", "Kanal", "Sq. Ft.", "Sq. Yd."] },
      _id: false,
    },
  })
  size?: {
    value: number;
    unit: string;
  };

  @Prop({
    type: String,
    enum: ["male", "female", "mixed"],
  })
  hostelType?: string;

  @Prop({ type: [String], default: [] }) mealPlan?: string[];
  @Prop({ type: [String], default: [] }) rules?: string[];

  @Prop({ type: Types.ObjectId, required: true, index: true })
  ownerId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Agency" })
  agency?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User" })
  listedBy?: Types.ObjectId;

  @Prop({ type: Boolean, default: false }) status!: boolean;
  @Prop({ type: Boolean, default: false }) isApproved!: boolean;

  @Prop({ type: Number, default: 1, enum: [1, 2, 3] })
  sortWeight!: number;

  @Prop({ type: Boolean, default: false })
  featured!: boolean;

  @Prop({ type: Date })
  featuredUntil?: Date;

  @Prop({ type: Boolean, default: false })
  isBoosted!: boolean;

  @Prop({ default: 0 })
  views!: number;

  @Prop({ default: 0 })
  impressions!: number;

  @Prop({
    type: String,
    enum: PropertyModerationStatus,
    default: PropertyModerationStatus.ACTIVE,
  })
  moderationStatus!: PropertyModerationStatus;

  @Prop({ default: true }) isVisible!: boolean;
  @Prop({ default: 0 }) reportCount!: number;
  @Prop({ default: 0 }) strikeCount!: number;

  @Prop() suspendedAt?: Date;
  @Prop() deletedAt?: Date;
}

export const PropertySchema = SchemaFactory.createForClass(Property);

/** INDEXES **/

// 1. PRIMARY SEARCH INDEX
PropertySchema.index({
  moderationStatus: 1,
  status: 1,
  isApproved: 1,
  sortWeight: -1,
  createdAt: -1,
});

// 2. PRICE ASC INDEX
PropertySchema.index({
  moderationStatus: 1,
  status: 1,
  isApproved: 1,
  monthlyRent: 1,
});

// 3. OWNER INDEXES
PropertySchema.index({ ownerId: 1, moderationStatus: 1 });
PropertySchema.index({ ownerId: 1, createdAt: -1 });

// 4. PRICE DESC INDEX
PropertySchema.index({
  moderationStatus: 1,
  status: 1,
  isApproved: 1,
  monthlyRent: -1,
});

// 5. GEO INDEX
PropertySchema.index({
  locationGeo: "2dsphere",
  moderationStatus: 1,
});

// 6. FEATURED INDEX
PropertySchema.index({
  status: 1,
  isApproved: 1,
  hostOption: 1,
  featured: -1,
  createdAt: -1,
});

// 7. GENERAL VISIBILITY INDEX
PropertySchema.index({
  status: 1,
  isApproved: 1,
  createdAt: -1,
});

// 8. PRICE & RECENCY INDEX
PropertySchema.index({
  status: 1,
  isApproved: 1,
  monthlyRent: 1,
  createdAt: -1,
});
PropertySchema.index({ "size.value": 1, "size.unit": 1 });
