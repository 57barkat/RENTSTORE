import { Injectable, Logger } from "@nestjs/common";
import fetch from "node-fetch";

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly apiKey = process.env.GOOGLE_API_KEY;

  constructor() {
    if (!this.apiKey) {
      this.logger.error("GOOGLE_API_KEY not set in environment variables!");
    }
  }

  /**
   * Converts user transcription text into property filters
   * Returns JSON object ready for MongoDB search
   */
  async textToFilters(userText: string) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5:generateText?key=${this.apiKey}`;

    const prompt = `
Convert this text into property search filters.
Return ONLY JSON with keys:
city, country, stateTerritory,
minRent, maxRent,
bedrooms, bathrooms, Persons,
amenities, bills,
hostOption

User query: "${userText}"
`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          temperature: 0,
          maxOutputTokens: 500,
        }),
      });

      const data = await response.json();

      // Gemini returns the generated text in data.candidates[0].content
      const text = data?.candidates?.[0]?.content?.trim() || "{}";

      // Try parsing JSON
      try {
        return JSON.parse(text);
      } catch (err) {
        this.logger.warn(
          "Failed to parse Gemini JSON, returning empty object.",
          text
        );
        return {};
      }
    } catch (err) {
      this.logger.error("Error calling Gemini API", err);
      return {};
    }
  }
}
