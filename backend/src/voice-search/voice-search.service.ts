import { Injectable, Logger } from "@nestjs/common";
import * as fs from "fs";
import fetch from "node-fetch";
import { PropertyService } from "../modules/property/property.service";
import { VoiceSessionService } from "./voice-session.service";

@Injectable()
export class VoiceSearchService {
  private readonly logger = new Logger(VoiceSearchService.name);
  private readonly geminiApiKey = process.env.GOOGLE_API_KEY;
  private readonly geminiModel = "gemini-2.0-flash";

  constructor(
    private readonly propertyService: PropertyService,
    private readonly voiceSessionService: VoiceSessionService,
  ) {}

  private requiredFilters = [
    "city",
    "hostOption",
    "minRent",
    "maxRent",
    "bedrooms",
  ];

  async voiceSearch(file: Express.Multer.File, userId: string) {
    if (!file?.path) throw new Error("Audio file path missing");
    try {
      // 1️⃣ Transcribe and translate voice to English
      const transcription = await this.audioToEnglishText(file.path);
      if (!transcription.trim()) return this.emptyResponse("Audio unclear");

      // 2️⃣ Extract filters from transcription in one go
      let extractedFilters = await this.textToFilters(transcription);

      // 3️⃣ Auto-fill hostOption if AI missed it but user mentioned "ghr/house"
      extractedFilters = this.ensureHostOption(extractedFilters, transcription);

      const normalizedFilters = this.normalizeFilters(extractedFilters);

      // 4️⃣ Update session
      const session = await this.voiceSessionService.getSession(userId);
      const currentFilters = {
        ...(session?.currentFilters ?? {}),
        ...normalizedFilters,
      };
      await this.voiceSessionService.updateSession(userId, currentFilters);

      // 5️⃣ Check if user wants to stop
      const stopWords = ["search", "show", "enough", "stop", "results", "skip"];
      const userWantsToStop = stopWords.some((word) =>
        transcription.toLowerCase().includes(word),
      );

      // 6️⃣ Identify truly missing filters
      const missing = this.requiredFilters.filter(
        (key) => !currentFilters[key],
      );

      if (missing.length > 0 && !userWantsToStop) {
        return {
          transcription,
          filters: currentFilters,
          result: null,
          missingQuestion: this.generatePrompt(missing[0]),
        };
      }

      // 7️⃣ Perform property search
      const result = await this.propertyService.findFiltered(
        1,
        10,
        currentFilters,
        userId,
      );
      await this.voiceSessionService.deleteSession(userId);

      return {
        transcription,
        filters: currentFilters,
        result,
        missingQuestion: null,
      };
    } finally {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }
  }

  // Generate follow-up questions
  private generatePrompt(key: string): string {
    const prompts = {
      city: "Which city are you looking in?",
      hostOption: "Are you looking for a house, room, or apartment?",
      minRent: "What is your minimum budget?",
      maxRent: "And what is the maximum rent you can pay?",
      bedrooms: "How many bedrooms do you need?",
    };
    return prompts[key] || `Please tell me about the ${key}`;
  }

  // 1️⃣ Audio transcription + translation
  private async audioToEnglishText(filePath: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${this.geminiApiKey}`;
    const audioBase64 = fs.readFileSync(filePath).toString("base64");
    const body = {
      contents: [
        {
          parts: [
            {
              text: "Transcribe this audio. If it is Urdu, translate it to English.",
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

  // 2️⃣ Extract filters from transcription
  private async textToFilters(userText: string): Promise<Record<string, any>> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${this.geminiApiKey}`;
    const body = {
      contents: [
        {
          parts: [
            {
              text: `
You are a Pakistan Real Estate Expert.

User text: "${userText}"

TASK:

Extract search filters for rental properties.

Translate Urdu/mixed Urdu-English into English.

Infer city if user only mentions sector/block/society.

Normalize rent numbers (1 lakh = 100000, 50k = 50000).

Infer other filters if mentioned: bedrooms, bathrooms, Persons, amenities, bills, highlighted, safety.

Ensure "addressQuery" contains ONLY the most specific local area (sector/block/society), never the city.

If multiple locations mentioned, return only the most specific one.

IMPORTANT SEARCH RULES:

If the text in voice is meaningless, irrelevant, or “trash talk”, return empty JSON {}.

Remove all punctuation (., / -) from addressQuery.

Trim, deduplicate, and normalize spaces.

JSON STRUCTURE:
{
  "city": "string",
  "addressQuery": "string",
  "minRent": number,
  "maxRent": number,
  "bedrooms": number,
  "bathrooms": number,
  "Persons": number,
  "hostOption": "home" | "hostel" | "apartment",
  "amenities": ["string"],
  "bills": ["string"],
  "highlighted": ["string"],
  "safety": ["string"],
  "relaxed": boolean
}

Return ONLY valid JSON.
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
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

      let parsed: Record<string, any> = {};
      try {
        parsed = JSON.parse(rawText);
      } catch {
        this.logger.warn("⚠️ AI returned invalid JSON, using empty object");
        parsed = {};
      }

      parsed.city = parsed.city || "";
      parsed.addressQuery = parsed.addressQuery || "";
      parsed.minRent = Number(parsed.minRent) || undefined;
      parsed.maxRent = Number(parsed.maxRent) || undefined;
      parsed.bedrooms = Number(parsed.bedrooms) || undefined;
      parsed.bathrooms = Number(parsed.bathrooms) || undefined;
      parsed.Persons = Number(parsed.Persons) || undefined;
      parsed.hostOption = parsed.hostOption || undefined;
      parsed.amenities = Array.isArray(parsed.amenities)
        ? parsed.amenities
        : [];
      parsed.bills = Array.isArray(parsed.bills) ? parsed.bills : [];
      parsed.highlighted = Array.isArray(parsed.highlighted)
        ? parsed.highlighted
        : [];
      parsed.safety = Array.isArray(parsed.safety) ? parsed.safety : [];
      parsed.relaxed =
        typeof parsed.relaxed === "boolean" ? parsed.relaxed : true;

      parsed.addressQuery = this.sanitizeAddressQuery(
        parsed.addressQuery,
        parsed.city,
      );

      return parsed;
    } catch (error) {
      this.logger.error(
        "❌ Filter extraction failed, returning empty object",
        error,
      );
      return {};
    }
  }

  // 3️⃣ Auto-fill hostOption if user said "ghr/house"
  private ensureHostOption(filters: any, userText: string): any {
    if (!filters.hostOption) {
      const lowerText = userText.toLowerCase();
      if (/(ghr|ghar|house)/i.test(lowerText)) filters.hostOption = "home";
      else if (/apartment|flat/i.test(lowerText))
        filters.hostOption = "apartment";
      else if (/hostel/i.test(lowerText)) filters.hostOption = "hostel";
    }
    return filters;
  }

  // Remove city duplicates & sanitize
  private sanitizeAddressQuery(addressQuery: string, city: string): string {
    if (!addressQuery) return "";
    let sanitized = addressQuery.replace(/\s+/g, " ").trim();
    if (city) sanitized = sanitized.replace(new RegExp(city, "gi"), "").trim();
    sanitized = sanitized.replace(/[.,\/\-]/g, " ").trim();
    return sanitized;
  }

  // Normalize filters
  private normalizeFilters(filters: any) {
    const normalized: any = {};
    if (!filters) return normalized;

    if (filters.city) normalized.city = filters.city;
    if (filters.addressQuery) normalized.addressQuery = filters.addressQuery;
    if (Number.isFinite(filters.minRent))
      normalized.minRent = Number(filters.minRent);
    if (Number.isFinite(filters.maxRent))
      normalized.maxRent = Number(filters.maxRent);
    if (Number.isFinite(filters.bedrooms))
      normalized.bedrooms = Number(filters.bedrooms);
    if (Number.isFinite(filters.bathrooms))
      normalized.bathrooms = Number(filters.bathrooms);
    if (Number.isFinite(filters.Persons))
      normalized.Persons = Number(filters.Persons);
    if (["home", "room", "apartment"].includes(filters.hostOption))
      normalized.hostOption = filters.hostOption;
    if (Array.isArray(filters.amenities))
      normalized.amenities = filters.amenities;
    if (Array.isArray(filters.bills)) normalized.bills = filters.bills;
    if (Array.isArray(filters.highlighted))
      normalized.highlighted = filters.highlighted;
    if (Array.isArray(filters.safety)) normalized.safety = filters.safety;
    if (typeof filters.relaxed === "boolean")
      normalized.relaxed = filters.relaxed;

    return normalized;
  }

  // Empty response template
  private emptyResponse(message: string) {
    return {
      transcription: "",
      filters: {},
      result: { data: [] },
      error: message,
    };
  }
}
