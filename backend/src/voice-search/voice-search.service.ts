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
     PUBLIC ENTRY POINT
     ============================================================ */
  async voiceSearch(file: Express.Multer.File, userId?: string) {
    if (!file?.path) {
      throw new Error("Audio file path missing");
    }

    try {
      // 1️⃣ Transcribe audio to English text
      const transcription = await this.audioToEnglishText(file.path);

      if (!transcription.trim()) {
        return this.emptyResponse(
          "Could not understand the audio. Please speak clearly.",
        );
      }

      // 2️⃣ Extract filters from transcription
      const extractedFilters = await this.textToFilters(transcription);
      const filters = this.normalizeFilters(extractedFilters);

      if (!Object.keys(filters).length) {
        return this.emptyResponse(
          "No searchable criteria detected from voice.",
        );
      }

      // 3️⃣ Call updated property search
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
      // 4️⃣ Cleanup audio file
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }
  }

  /* ============================================================
     AUDIO → ENGLISH TEXT (URDU / MIXED SUPPORTED)
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
- Translate Urdu/mixed text to English.
- Infer city if user only mentions sector/block/society.
- Normalize rent numbers (1 lakh = 100000, 50k = 50000).

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

      return JSON.parse(rawText);
    } catch (error) {
      this.logger.error("❌ Filter extraction failed", error);
      return {};
    }
  }

  /* ============================================================
     NORMALIZE FILTERS FOR SAFETY
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

    if (["home", "room", "apartment"].includes(filters.hostOption)) {
      normalized.hostOption = filters.hostOption;
    }

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
