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
You are a strict JSON filter extractor for a Pakistan rental platform.

User text: "${userText}"

Your job:
1. Detect abusive or irrelevant text.
2. Extract ONLY valid filters.
3. Never explain.
4. Never add extra keys.
5. Never guess.
6. If a filter is not mentioned, return null for numbers/strings and [] for arrays.

Rules:

CITY:
- Must be a major Pakistani city.
- If society/area mentioned, put it in addressQuery.

RENT:
- 1 lakh = 100000
- 50k = 50000
- If only one rent value mentioned → set maxRent and minRent = 0.

PROPERTY TYPE:
- hostOption must be exactly: "home", "hostel", or "apartment".

HOSTEL TYPE:
- Must be exactly: "male", "female", or "mixed".

AMENITIES:
Allowed keys only:
wifi, tv, kitchen, washer, free_parking, paid_parking, ac, workspace,
pool, hot_tub, patio, bbq, outdoor_dining, fire_pit, pool_table,
fireplace, piano, exercise, lake_access, beach_access,
ski_in_out, outdoor_shower, smoke_alarm, first_aid,
fire_extinguisher, co_alarm

If AC mentioned → use "ac"
If parking mentioned → choose correct parking key

ARRAY RULE:
If not mentioned → return empty array [].

Return STRICT JSON ONLY:

{
  "isAbusive": boolean,
  "filters": {
    "city": string | null,
    "addressQuery": string | null,
    "minRent": number | null,
    "maxRent": number | null,
    "bedrooms": number | null,
    "bathrooms": number | null,
    "floorLevel": number | null,
    "hostOption": "home" | "hostel" | "apartment" | null,
    "hostelType": "female" | "male" | "mixed" | null,
    "amenities": string[],
    "bills": string[],
    "mealPlan": string[],
    "rules": string[]
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

    const toNumber = (v: any) =>
      v !== null && v !== undefined && !isNaN(v) ? Number(v) : undefined;

    if (filters.city) normalized.city = filters.city;
    if (filters.addressQuery) normalized.addressQuery = filters.addressQuery;

    if (toNumber(filters.minRent) !== undefined)
      normalized.minRent = toNumber(filters.minRent);

    if (toNumber(filters.maxRent) !== undefined)
      normalized.maxRent = toNumber(filters.maxRent);

    if (toNumber(filters.bedrooms) !== undefined)
      normalized.bedrooms = toNumber(filters.bedrooms);

    if (toNumber(filters.bathrooms) !== undefined)
      normalized.bathrooms = toNumber(filters.bathrooms);

    if (toNumber(filters.floorLevel) !== undefined)
      normalized.floorLevel = toNumber(filters.floorLevel);

    if (filters.hostOption) normalized.hostOption = filters.hostOption;

    if (filters.hostelType) normalized.hostelType = filters.hostelType;

    normalized.amenities = Array.isArray(filters.amenities)
      ? filters.amenities
      : [];

    normalized.bills = Array.isArray(filters.bills) ? filters.bills : [];

    normalized.mealPlan = Array.isArray(filters.mealPlan)
      ? filters.mealPlan
      : [];

    normalized.rules = Array.isArray(filters.rules) ? filters.rules : [];

    return normalized;
  }

  private emptyResponse(message: string) {
    return { transcription: "", filters: {}, result: null, message };
  }
}
