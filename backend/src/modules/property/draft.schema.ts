import { Schema, model, Types } from "mongoose";

export const PropertyDraftSchema = new Schema(
  {
    title: String,
    hostOption: String,
    location: String, // human-readable
    lat: Number, // latitude
    lng: Number, // longitude
    monthlyRent: Number,
    dailyRent: Number,
    weeklyRent: Number,
    defaultRentType: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      default: "monthly",
    },
    SecuritybasePrice: Number,
    ALL_BILLS: [String],
    address: [
      {
        aptSuiteUnit: String,
        street: String,
        city: String,
        stateTerritory: String,
        country: String,
        zipCode: String,
      },
    ],
    addressQuery: String,
    addressQueryNormalized: { type: String, index: true, select: false },
    searchText: { type: String, select: false },
    amenities: [String],
    capacityState: {
      Persons: Number,
      bedrooms: Number,
      beds: Number,
      bathrooms: Number,
    },
    description: {
      highlighted: [String],
    },
    safetyDetailsData: {
      safetyDetails: [String],
      cameraDescription: String,
    },
    photos: [String],
    ownerId: { type: Types.ObjectId, ref: "User" },
    status: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const PropertyDraft = model("PropertyDraft", PropertyDraftSchema);
