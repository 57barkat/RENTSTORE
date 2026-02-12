import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type VoiceSessionDocument = VoiceSession & Document;

@Schema({ timestamps: true })
export class VoiceSession {
  @Prop({ required: true, unique: true })
  userId: string;

  @Prop({ type: Object, default: {} })
  currentFilters: Record<string, any>;
}

export const VoiceSessionSchema = SchemaFactory.createForClass(VoiceSession);
