import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Document } from "mongoose";
import { VoiceSession } from "./voice-session.schema";

export type VoiceSessionDocument = VoiceSession & Document;

@Injectable()
export class VoiceSessionService {
  constructor(
    @InjectModel(VoiceSession.name)
    private sessionModel: Model<VoiceSessionDocument>,
  ) {}

  async createSession(userId: string, currentFilters: Record<string, any>) {
    const pendingQuestions = this.getMissingQuestions(currentFilters);
    const session = new this.sessionModel({
      userId,
      currentFilters,
      pendingQuestions,
    });
    return session.save();
  }

  async getMissingQuestions(filters: Record<string, any>) {
    const questions: string[] = [];
    if (!filters.minRent) questions.push("minRent");
    if (!filters.maxRent) questions.push("maxRent");
    if (!filters.bedrooms) questions.push("bedrooms");
    if (!filters.bathrooms) questions.push("bathrooms");
    return questions;
  }

  async updateSession(userId: string, currentFilters: Record<string, any>) {
    return this.sessionModel
      .findOneAndUpdate(
        { userId },
        { currentFilters, updatedAt: new Date() },
        { new: true, upsert: true },
      )
      .lean()
      .exec();
  }

  async getSession(userId: string) {
    return this.sessionModel.findOne({ userId }).lean().exec();
  }

  async deleteSession(userId: string) {
    return this.sessionModel.deleteOne({ userId }).exec();
  }
}
