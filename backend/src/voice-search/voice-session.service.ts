import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Document } from "mongoose";
import { VoiceSession } from "./voice-session.schema";

@Injectable()
export class VoiceSessionService {
  constructor(
    @InjectModel(VoiceSession.name)
    private sessionModel: Model<VoiceSession & Document>,
  ) {}

  async createSession(userId: string, currentFilters: Record<string, any>) {
    return new this.sessionModel({ userId, currentFilters }).save();
  }

  async updateSession(userId: string, currentFilters: Record<string, any>) {
    return this.sessionModel
      .findOneAndUpdate(
        { userId },
        { currentFilters, updatedAt: new Date() },
        { new: true, upsert: true },
      )
      .exec();
  }

  async getSession(userId: string) {
    return this.sessionModel.findOne({ userId }).exec();
  }

  async deleteSession(userId: string) {
    return this.sessionModel.deleteOne({ userId }).exec();
  }
}
