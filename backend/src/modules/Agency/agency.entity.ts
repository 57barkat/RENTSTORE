import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type AgencyDocument = Agency & Document;

@Schema({ timestamps: true })
export class Agency {
  @Prop({ required: true })
  name: string;

  @Prop()
  logo?: string;

  @Prop()
  address?: string;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  owner: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: "User" }], default: [] })
  agents: Types.ObjectId[];
}

export const AgencySchema = SchemaFactory.createForClass(Agency);
