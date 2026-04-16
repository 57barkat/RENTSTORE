import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class Payment extends Document {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, unique: true })
  tracker!: string;

  @Prop({ required: true })
  amount!: number;

  @Prop({ required: true, default: "PKR" })
  currency!: string;

  @Prop({ required: true })
  packageId!: string;

  @Prop({
    required: true,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending",
  })
  status!: string;

  @Prop()
  paymentMethod!: string;

  @Prop({ type: Object })
  rawResponse: any;
  @Prop({ type: Date, default: Date.now })
  createdAt!: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
