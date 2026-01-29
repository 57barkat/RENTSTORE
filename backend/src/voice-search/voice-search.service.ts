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
      // 1️⃣ Transcribe audio to text
      const transcription = await this.audioToEnglishText(file.path);

      if (!transcription.trim()) {
        return this.emptyResponse(
          "Could not understand the audio. Please speak clearly.",
        );
      }

      // 2️⃣ Extract filters from text using AI
      const extractedFilters = await this.textToFilters(transcription);

      // 3️⃣ Normalize filters for backend search
      const filters = this.normalizeFilters(extractedFilters);

      if (!Object.keys(filters).length) {
        return this.emptyResponse(
          "No searchable criteria detected from voice.",
        );
      }

      // 4️⃣ Call backend to find properties
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
     TEXT → FILTER EXTRACTION (Full Filters)
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

Extract search filters for rental properties.

Translate Urdu/mixed Urdu-English into English.

Infer city if user only mentions sector/block/society.

Normalize rent numbers (1 lakh = 100000, 50k = 50000).

Infer other filters if mentioned: bedrooms, bathrooms, Persons, amenities, bills, highlighted, safety.

Ensure "addressQuery" contains ONLY the most specific local area (sector/block/society), never the city.

If multiple locations mentioned, return only the most specific one.

IMPORTANT SEARCH RULES:

If the text in voice is meaningless, irrelevant, or “trash talk”, return nothing (empty JSON {}) to avoid wrong search results.

Only extract filters if the user’s input is clearly about rental property needs.

Remove all punctuation (., / -) from addressQuery.

Trim, deduplicate, and normalize spaces.

addressQuery should match partially and across multiple fields (title, location, description, address.street).

City must always be prioritized; if nothing matches the addressQuery in the city, fallback to all properties in the city.

Relax secondary filters (minRent, maxRent, bedrooms, bathrooms, Persons) if needed.

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
