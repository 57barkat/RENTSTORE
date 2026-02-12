import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type VoiceSessionDocument = VoiceSession & Document;

@Schema({ timestamps: true })
export class VoiceSession {
  @Prop({ required: true, unique: true })
  userId: string;

  @Prop({ type: Object, default: {} })
  currentFilters: Record<string, any>;
  @Prop({ type: Boolean, default: false })
  hasAskedOnce: boolean;
  @Prop({ type: Boolean, default: false })
  hasAskedCity: boolean;
}

export const VoiceSessionSchema = SchemaFactory.createForClass(VoiceSession);
