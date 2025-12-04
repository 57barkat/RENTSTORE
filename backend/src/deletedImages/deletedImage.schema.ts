import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class DeletedImage extends Document {
  @Prop({ required: true }) url: string;
  @Prop({ required: true }) userId: string;
  @Prop({ type: String, enum: ["property", "draft"], default: "property" })
  entityType: string;
}

export const DeletedImageSchema = SchemaFactory.createForClass(DeletedImage);
