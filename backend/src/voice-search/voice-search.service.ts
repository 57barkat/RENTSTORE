import { Injectable, Logger } from "@nestjs/common";
import * as fs from "fs";
import fetch from "node-fetch";
import { PropertyService } from "../modules/property/property.service";

@Injectable()
export class VoiceSearchService {
  private readonly logger = new Logger(VoiceSearchService.name);
  private readonly geminiApiKey = process.env.GOOGLE_API_KEY;
  private readonly geminiModel = "gemini-2.5-flash-lite";

  constructor(private readonly propertyService: PropertyService) {
    if (!this.geminiApiKey) {
      this.logger.error("❌ GOOGLE_API_KEY not set in environment variables");
    }
  }

  /* ============================================================
     PUBLIC ENTRY POINT
  ============================================================ */
  async voiceSearch(file: Express.Multer.File, userId?: string) {
    if (!file?.path) throw new Error("Audio file path missing");

    try {
      const transcription = await this.audioToEnglishText(file.path);

      if (!transcription.trim()) {
        return this.emptyResponse(
          "Could not understand the audio. Please speak clearly.",
        );
      }

      const extractedFilters = await this.textToFilters(transcription);
      const filters = this.normalizeFilters(extractedFilters);

      if (!Object.keys(filters).length) {
        return this.emptyResponse(
          "No searchable criteria detected from voice.",
        );
      }

      const result = await this.propertyService.findFiltered(
        1,
        10,
        filters,
        userId,
      );

      return {
        transcription,
        filters,
        result,
      };
    } finally {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }
  }

  /* ============================================================
     AUDIO → ENGLISH TEXT
  ============================================================ */
  private async audioToEnglishText(filePath: string): Promise<string> {
    this.logger.log(`Transcribing audio file: ${filePath}`);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${this.geminiApiKey}`;
    const audioBase64 = fs.readFileSync(filePath).toString("base64");

    const body = {
      contents: [
        {
          parts: [
            {
              text: `
You are a speech-to-text engine.
- Translate Urdu/mixed Urdu-English to fluent English.
- Normalize numbers (lakh, hazar, k) to numeric values.
- Return only the final English text.
`,
            },
            {
              inline_data: { mime_type: "audio/mp4", data: audioBase64 },
            },
          ],
        },
      ],
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

      if (!text) this.logger.warn("⚠️ Gemini returned empty transcription");

      return text;
    } catch (error) {
      this.logger.error("❌ Audio transcription failed", error);
      return "";
    }
  }

  /* ============================================================
     TEXT → FILTER EXTRACTION
  ============================================================ */
  private async textToFilters(userText: string) {
    this.logger.log(`Extracting filters from text: ${userText}`);

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
- Extract search filters for rental properties.
- Translate Urdu/mixed Urdu-English into English.
- Infer city if user only mentions sector/block/society.
- Normalize rent numbers (1 lakh = 100000, 50k = 50000).

CRITICAL RULES:
- "addressQuery" must contain ONLY the LOCAL AREA (sector/block/society).
- DO NOT include city names in "addressQuery".
- Remove commas, dots, slashes, hyphens, or special characters.
- If multiple locations mentioned, return only the most specific.

JSON STRUCTURE:
{
  "city": "string",
  "addressQuery": "string",
  "minRent": number,
  "maxRent": number,
  "bedrooms": number,
  "hostOption": "home" | "room" | "apartment"
}

Return ONLY valid JSON.
`,
            },
          ],
        },
      ],
      generationConfig: {
        response_mime_type: "application/json",
        temperature: 0.0,
      },
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

      const parsed = JSON.parse(rawText);

      // Sanitize addressQuery
      parsed.addressQuery = this.sanitizeAddressQuery(
        parsed.addressQuery,
        parsed.city,
      );

      return parsed;
    } catch (error) {
      this.logger.error("❌ Filter extraction failed", error);
      return {};
    }
  }

  /* ============================================================
     SANITIZE ADDRESS QUERY
     - Remove city names
     - Remove punctuation
     - Trim and deduplicate
  ============================================================ */
  private sanitizeAddressQuery(addressQuery: string, city: string): string {
    if (!addressQuery) return "";
    let sanitized = addressQuery;

    // Remove city name (case-insensitive)
    if (city) {
      const cityRegex = new RegExp(city, "gi");
      sanitized = sanitized.replace(cityRegex, "");
    }

    // Remove punctuation: , . / -
    sanitized = sanitized.replace(/[.,\/\-]/g, " ");

    // Collapse multiple spaces
    sanitized = sanitized.replace(/\s+/g, " ").trim();

    return sanitized;
  }

  /* ============================================================
     NORMALIZE FILTERS
  ============================================================ */
  private normalizeFilters(filters: any) {
    this.logger.log("Normalizing extracted filters:", filters);
    const normalized: any = {};

    if (filters.city) normalized.city = filters.city;
    if (filters.addressQuery) normalized.addressQuery = filters.addressQuery;
    if (Number.isFinite(filters.minRent))
      normalized.minRent = Number(filters.minRent);
    if (Number.isFinite(filters.maxRent))
      normalized.maxRent = Number(filters.maxRent);
    if (Number.isFinite(filters.bedrooms))
      normalized.bedrooms = Number(filters.bedrooms);
    if (["home", "room", "apartment"].includes(filters.hostOption))
      normalized.hostOption = filters.hostOption;

    return normalized;
  }

  /* ============================================================
     EMPTY RESPONSE HANDLER
  ============================================================ */
  private emptyResponse(message: string) {
    this.logger.warn(message);
    return {
      transcription: "",
      filters: {},
      result: { data: [], total: 0, page: 1, limit: 10, totalPages: 0 },
      error: message,
    };
  }
}
