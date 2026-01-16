import { Injectable, Logger } from "@nestjs/common";
import * as fs from "fs";
import fetch from "node-fetch";
import { PropertyService } from "../modules/property/property.service";

@Injectable()
export class VoiceSearchService {
  private readonly logger = new Logger(VoiceSearchService.name);
  private readonly geminiApiKey = process.env.GOOGLE_API_KEY;

  // Stable free-tier Gemini model
  private readonly geminiModel = "gemini-2.5-flash-lite";

  constructor(private readonly propertyService: PropertyService) {
    if (!this.geminiApiKey) {
      this.logger.error("❌ GOOGLE_API_KEY not set in environment variables");
    }
  }

  /* ============================================================
     PUBLIC ENTRY
     ============================================================ */
  async voiceSearch(file: Express.Multer.File, userId?: string) {
    if (!file?.path) {
      throw new Error("Audio file path missing");
    }

    try {
      const transcription = await this.audioToEnglishText(file.path);

      // ❌ HARD BLOCK: No transcription
      if (!transcription.trim()) {
        return this.emptyResponse(
          "Could not understand the audio. Please speak clearly."
        );
      }

      const extractedFilters = await this.textToFilters(transcription);
      const filters = this.normalizeFilters(extractedFilters);

      // ❌ HARD BLOCK: No usable filters
      if (!Object.keys(filters).length) {
        return this.emptyResponse(
          "No searchable criteria detected from voice."
        );
      }

      const result = await this.propertyService.findFiltered(
        1,
        10,
        filters,
        userId
      );

      return {
        transcription,
        filters,
        result,
      };
    } finally {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }
  }

  /* ============================================================
     AUDIO → ENGLISH TEXT (URDU / MIXED SUPPORTED)
     ============================================================ */
  private async audioToEnglishText(filePath: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${this.geminiApiKey}`;

    const audioBase64 = fs.readFileSync(filePath).toString("base64");

    const body = {
      contents: [
        {
          parts: [
            {
              text: `
You are a speech-to-text engine.

Rules:
- If language is Urdu or mixed Urdu-English, translate to fluent English.
- If already English, return as-is.
- Normalize numbers (lakh, hazar, k).
- Return ONLY the final English sentence.
`,
            },
            {
              inline_data: {
                mime_type: "audio/mpeg",
                data: audioBase64,
              },
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

      if (!text) {
        this.logger.warn("⚠️ Gemini returned empty transcription");
      }

      return text;
    } catch (error) {
      this.logger.error("❌ Audio transcription failed", error);
      return "";
    }
  }

  /* ============================================================
     TEXT → FILTER EXTRACTION (ANY CITY / MUHALLA)
     ============================================================ */
  private async textToFilters(userText: string) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${this.geminiApiKey}`;

    const body = {
      contents: [
        {
          parts: [
            {
              text: `
You are a Pakistan real estate search engine.

Extract filters from:
"${userText}"

Rules:
- Support ANY city, town, muhalla, gali, sector, society.
- If exact area not known, store it in "addressQuery".
- Always extract any sector, society, muhalla, phase, block, gali, road
into "addressQuery" even if city is known.
- Convert price slang:
  - 1 lakh = 100000
  - 50 hazar = 50000
  - 70k = 70000
- If single rent mentioned → set both minRent & maxRent.
- Bedrooms must be numeric.

Return ONLY valid JSON:
{
  "city": string,
  "stateTerritory": string,
  "addressQuery": string,
  "minRent": number,
  "maxRent": number,
  "bedrooms": number,
  "amenities": string[]
}
`,
            },
          ],
        },
      ],
      generationConfig: {
        response_mime_type: "application/json",
        temperature: 0.1,
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

      return JSON.parse(rawText);
    } catch (error) {
      this.logger.error("❌ Filter extraction failed", error);
      return {};
    }
  }

  /* ============================================================
     FILTER NORMALIZATION (SAFETY)
     ============================================================ */
  private normalizeFilters(filters: any) {
    const normalized: any = {};

    if (filters.city) normalized.city = filters.city;
    if (filters.stateTerritory)
      normalized.stateTerritory = filters.stateTerritory;
    if (filters.addressQuery) normalized.addressQuery = filters.addressQuery;

    if (Number.isFinite(filters.minRent))
      normalized.minRent = Number(filters.minRent);
    if (Number.isFinite(filters.maxRent))
      normalized.maxRent = Number(filters.maxRent);

    if (Number.isFinite(filters.bedrooms))
      normalized.bedrooms = Number(filters.bedrooms);

    if (Array.isArray(filters.amenities) && filters.amenities.length) {
      normalized.amenities = filters.amenities;
    }

    return normalized;
  }

  /* ============================================================
     EMPTY SAFE RESPONSE
     ============================================================ */
  private emptyResponse(message: string) {
    return {
      transcription: "",
      filters: {},
      result: {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
      error: message,
    };
  }
}
