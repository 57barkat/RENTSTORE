import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Property extends Document {
  @Prop({ required: true }) propertyType: string;
  @Prop({ required: true }) title: string;
  @Prop({ required: true }) description: string;
  @Prop({ required: true }) address: string;
  @Prop({ required: true }) city: string;
  @Prop({ required: true }) area: string;

  @Prop() latitude?: number;
  @Prop() longitude?: number;

  @Prop() bedrooms?: number;
  @Prop() bathrooms?: number;
  @Prop() kitchens?: number;
  @Prop() livingRooms?: number;
  @Prop() balconies?: number;
  @Prop() furnished?: boolean;
  @Prop() floor?: number;
  @Prop() totalArea?: string;

  @Prop({ required: true }) rentPrice: number;
  @Prop() securityDeposit?: number;
  @Prop() maintenanceCharges?: number;
  @Prop() utilitiesIncluded?: boolean;

  @Prop([String]) images?: string[];
  @Prop([String]) amenities?: string[];
  @Prop([String]) preferences?: string[];

  // 🔑 Who uploaded it
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;
}

export const PropertySchema = SchemaFactory.createForClass(Property);
