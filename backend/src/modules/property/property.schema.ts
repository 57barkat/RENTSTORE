import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ _id: false })
class Address {
  @Prop({ required: true }) street: string;
  @Prop({ required: true }) city: string;
  @Prop({ required: true }) stateTerritory: string;
  @Prop({ required: false }) country: string;
  @Prop({ required: true }) zipCode: string;
  @Prop() aptSuiteUnit?: string;
}

@Schema({ _id: false })
class CapacityState {
  @Prop({ required: true }) guests: number;
  @Prop({ required: true }) bedrooms: number;
  @Prop({ required: true }) beds: number;
  @Prop({ required: true }) bathrooms: number;
}

@Schema({ _id: false })
class SafetyDetailsData {
  @Prop([String]) safetyDetails: string[];
  @Prop() cameraDescription?: string;
}

@Schema({ _id: false })
class Description {
  @Prop([String]) highlighted?: string[];
}

@Schema({ timestamps: true })
export class Property extends Document {
  @Prop({ default: 0 })
  views: number;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  hostOption: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  monthlyRent: number;

  @Prop({ required: true })
  SecuritybasePrice: number;

  @Prop([String])
  ALL_BILLS?: string[];

  @Prop({ type: [Address], required: true })
  address: Address[];

  @Prop([String])
  amenities?: string[];

  @Prop({ type: CapacityState, required: true })
  capacityState: CapacityState;

  @Prop({ type: Description })
  description?: Description;

  @Prop({ type: SafetyDetailsData })
  safetyDetailsData?: SafetyDetailsData;

  @Prop([String])
  photos?: string[];

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  ownerId: Types.ObjectId;
}

export const PropertySchema = SchemaFactory.createForClass(Property);
