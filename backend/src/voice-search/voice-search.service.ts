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
          "Could not understand the audio. Please speak clearly.",
        );
      }

      const extractedFilters = await this.textToFilters(transcription);
      const filters = this.normalizeFilters(extractedFilters);

      // ❌ HARD BLOCK: No usable filters
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
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }
  }

  /* ============================================================
     AUDIO → ENGLISH TEXT (URDU / MIXED SUPPORTED)
     ============================================================ */
  private async audioToEnglishText(filePath: string): Promise<string> {
    console.log("Transcribing audio file:", filePath);
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
                mime_type: "audio/mp4",
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
    console.log("Extracting filters from text:", userText);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${this.geminiApiKey}`;

    const body = {
      contents: [
        {
          parts: [
            {
              text: `
You are a Pakistan Real Estate Expert and Geographic Assistant.

User text: "${userText}"

TASK:
1. Extract search filters for rental properties.
2. If language is Urdu or mixed, translate the intent to English.
3. INFER THE CITY: If the user mentions an area but NOT the city, use your internal knowledge of Pakistan's geography to fill the "city" field.
   - Example: "G-13" or "B-17" or "E-11" -> city: "Islamabad"
   - Example: "DHA Phase 6" or "Model Town" -> city: "Lahore" (unless context suggests otherwise)
   - Example: "Bahria Phase 8" -> city: "Rawalpindi"
   - Example: "Clifton" or "Gulistan-e-Johar" -> city: "Karachi"

RULES:
- addressQuery: Should contain the specific sector, block, or society name (e.g., "Sector G-13", "DHA Phase 5").
- city: Always try to provide a city name. If completely unknown, omit the field.
- minRent/maxRent: Normalize (1 lakh = 100000, 50k = 50000).
- hostOption: Must be "home", "room", or "apartment".

JSON STRUCTURE:
{
  "city": "string",
  "addressQuery": "string",
  "minRent": number,
  "maxRent": number,
  "bedrooms": number,
  "hostOption": "home" | "room" | "apartment"
}

Return ONLY valid JSON. Nothing else.
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

      // Ensure we return valid JSON
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
    console.log("Normalizing extracted filters:", filters);
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
    console.log("Returning empty response:", message);
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
