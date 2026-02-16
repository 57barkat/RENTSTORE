import { Injectable, Logger } from "@nestjs/common";
import * as fs from "fs";
import fetch from "node-fetch";
import { PropertyService } from "../modules/property/property.service";
import { VoiceSessionService } from "./voice-session.service";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "src/modules/user/user.entity";
import { Model } from "mongoose";

@Injectable()
export class VoiceSearchService {
  private readonly logger = new Logger(VoiceSearchService.name);
  private readonly geminiApiKey = process.env.GOOGLE_API_KEY;
  private readonly geminiModel = "gemini-2.0-flash";

  constructor(
    private readonly propertyService: PropertyService,
    private readonly voiceSessionService: VoiceSessionService,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async clearSession(userId: string) {
    return this.voiceSessionService.deleteSession(userId);
  }

  async voiceSearch(file: Express.Multer.File, userId: string) {
    if (!file?.path) throw new Error("Audio file path missing");

    try {
      const user = await this.userModel.findById(userId);

      if (!user) {
        return this.emptyResponse("User not found.");
      }

      // 🚫 Already blocked
      if (user.isBlocked) {
        return {
          forceLogout: true,
          message:
            "Your account has been blocked due to repeated policy violations.",
        };
      }

      // 1️⃣ TRANSCRIPTION
      const transcription = await this.audioToEnglishText(file.path);

      if (!transcription.trim()) {
        return this.emptyResponse("I couldn't hear you. Please try again.");
      }

      // 2️⃣ FILTER EXTRACTION + ABUSE CHECK
      const aiData = await this.extractIntent(transcription);

      // 🚨 HANDLE ABUSE
      if (aiData.isAbusive) {
        const updatedUser = await this.userModel.findByIdAndUpdate(
          userId,
          { $inc: { warnings: 1 } },
          { new: true },
        );
        if (!updatedUser) {
          return;
        }
        if (updatedUser.warnings >= 2) {
          await this.userModel.findByIdAndUpdate(userId, {
            isBlocked: true,
            refreshToken: null,
          });

          return {
            forceLogout: true,
            message:
              "Your account has been permanently blocked due to repeated abusive behavior.",
          };
        }

        return this.emptyResponse(
          `Warning no ${updatedUser.warnings}. After 2 warnings, your account will be blocked. Please refrain from using abusive or irrelevant language.`,
        );
      }

      let extractedFilters = this.ensureHostOption(
        aiData.filters,
        transcription,
      );

      const normalizedFilters = this.normalizeFilters(extractedFilters);

      const session = await this.voiceSessionService.getSession(userId);

      const currentFilters = {
        ...(session?.currentFilters ?? {}),
        ...normalizedFilters,
      };

      await this.voiceSessionService.updateSession(userId, currentFilters);

      const result = await this.propertyService.findFiltered(
        1,
        10,
        currentFilters,
        userId,
      );

      const hasResults = result && result.data.length > 0;

      if (hasResults) {
        await this.voiceSessionService.deleteSession(userId);
      }

      return {
        transcription,
        filters: currentFilters,
        result: hasResults ? result : null,
        message: hasResults
          ? "Showing you matching properties."
          : "No matching properties found. Please try a different search.",
      };
    } finally {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }
  }

  // 🔥 NEW: Combined abuse detection + filter extraction
  private async extractIntent(
    userText: string,
  ): Promise<{ isAbusive: boolean; filters: any }> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${this.geminiApiKey}`;

    const body = {
      contents: [
        {
          parts: [
            {
              text: `
You are a Pakistan Real Estate Assistant.

User text: "${userText}"

TASKS:
1. Detect if text contains abusive, irrelevant, or nonsense language.
2. Extract rental property filters.

If abusive or irrelevant:
- Set "isAbusive": true
- filters should be empty object

If normal:
- Set "isAbusive": false
- Extract filters correctly.

CITY RULE:
- City must be major Pakistani city.
- Society goes in addressQuery.
- 1 lakh = 100000
- 50k = 50000
- hostOption must be "home", "hostel", or "apartment"
- if min max is not provided but rent is mentioned, use it as maxRent and set minRent to 0.

Return ONLY JSON:

{
  "isAbusive": boolean,
  "filters": {
    "city": "",
    "addressQuery": "",
    "minRent": number,
    "maxRent": number,
    "bedrooms": number,
    "bathrooms": number,
    "floorLevel": number,
    "hostOption": "home" | "hostel" | "apartment"
  }
}
`,
            },
          ],
        },
      ],
      generationConfig: {
        response_mime_type: "application/json",
        temperature: 0,
      },
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data: any = await response.json();
      return JSON.parse(
        data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}",
      );
    } catch {
      return { isAbusive: false, filters: {} };
    }
  }

  private async audioToEnglishText(filePath: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${this.geminiApiKey}`;

    const audioBase64 = fs.readFileSync(filePath).toString("base64");

    const body = {
      contents: [
        {
          parts: [
            {
              text: "Transcribe this audio into English text. Detect if Urdu was spoken.",
            },
            { inline_data: { mime_type: "audio/mp4", data: audioBase64 } },
          ],
        },
      ],
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data: any = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
  }

  private ensureHostOption(filters: any, userText: string): any {
    if (!filters?.hostOption) {
      const lowerText = userText.toLowerCase();

      if (/(ghr|ghar|house)/i.test(lowerText)) filters.hostOption = "home";
      else if (/apartment|flat/i.test(lowerText))
        filters.hostOption = "apartment";
      else if (/hostel/i.test(lowerText)) filters.hostOption = "hostel";
    }

    return filters;
  }

  private normalizeFilters(filters: any) {
    const normalized: any = {};
    if (!filters) return normalized;

    if (filters.city) normalized.city = filters.city;
    if (filters.addressQuery) normalized.addressQuery = filters.addressQuery;
    if (filters.minRent) normalized.minRent = Number(filters.minRent);
    if (filters.maxRent) normalized.maxRent = Number(filters.maxRent);
    if (filters.bedrooms) normalized.bedrooms = Number(filters.bedrooms);
    if (filters.hostOption) normalized.hostOption = filters.hostOption;

    return normalized;
  }

  private emptyResponse(message: string) {
    return { transcription: "", filters: {}, result: null, message };
  }
}
