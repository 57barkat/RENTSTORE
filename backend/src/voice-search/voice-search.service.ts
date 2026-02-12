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
  async clearSession(userId: string) {
    return this.voiceSessionService.deleteSession(userId);
  }

  async voiceSearch(file: Express.Multer.File, userId: string) {
    if (!file?.path) throw new Error("Audio file path missing");
    try {
      // Transcription now handles language detection
      const transcription = await this.audioToEnglishText(file.path);
      if (!transcription.trim()) {
        return this.emptyResponse(
          "I'm sorry, I couldn't hear that clearly. Could you please repeat your requirements?",
        );
      }

      let extractedFilters = await this.textToFilters(transcription);
      extractedFilters = this.ensureHostOption(extractedFilters, transcription);
      const normalizedFilters = this.normalizeFilters(extractedFilters);

      const session = await this.voiceSessionService.getSession(userId);
      const currentFilters = {
        ...(session?.currentFilters ?? {}),
        ...normalizedFilters,
      };
      await this.voiceSessionService.updateSession(userId, currentFilters);

      const stopWords = [
        "search",
        "show",
        "enough",
        "stop",
        "results",
        "skip",
        "find",
      ];
      const userWantsToStop = stopWords.some((word) =>
        transcription.toLowerCase().includes(word),
      );

      const missing = this.requiredFilters.filter(
        (key) => !currentFilters[key],
      );

      // Strict filter: no relax fallback
      let result: { data: any[] } | null = null;
      let forceConversation = false;

      if (missing.length === 0 || userWantsToStop) {
        result = await this.propertyService.findFiltered(
          1,
          10,
          currentFilters,
          userId,
        );

        if (!result || result?.data.length === 0) {
          forceConversation = true; // Force Gemini to explain nothing was found
          result = null;
        } else {
          await this.voiceSessionService.deleteSession(userId);
        }
      }

      const aiMessage = await this.generateConversationalMessage(
        transcription,
        currentFilters,
        missing,
        userWantsToStop,
        forceConversation,
      );

      return {
        transcription,
        filters: currentFilters,
        result,
        message: aiMessage,
      };
    } finally {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
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
              text: "Transcribe this audio. If the user is speaking Urdu, transcribe it into English text but keep a mental note of the original language for the next turn.",
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
1. Extract search filters for rental properties.
2. CITY vs ADDRESS RULES:
   - "city" MUST be a major Pakistani city (e.g., Lahore, Islamabad, Karachi, Rawalpindi, Peshawar, Multan).
   - "addressQuery" MUST be the specific society, sector, or block (e.g., Bahria Town, DHA Phase 5, Gulberg, E-11).
   - NEVER put "Bahria Town" or "DHA" in the "city" field. 
   - If the user says "Bahria Town Lahore", city is "Lahore" and addressQuery is "Bahria Town".
   - If the user only says "Bahria Town" and doesn't mention a city, try to infer the city from context or leave "city" empty so I can ask the user later.

3. DATA NORMALIZATION:
   - 1 lakh = 100000, 50k = 50000.
   - hostOption must be: "home", "hostel", or "apartment".

JSON STRUCTURE:
{
  "city": "string",
  "addressQuery": "string",
  "minRent": number,
  "maxRent": number,
  "bedrooms": number,
  "bathrooms": number,
  "floorLevel": number,
  "hostOption": "home" | "hostel" | "apartment"
}
Return ONLY valid JSON.`,
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
      const parsed = JSON.parse(rawText);

      // Manual Safeguard: If Gemini still puts Bahria/DHA in city
      const societyNames = [
        "bahria",
        "dha",
        "gulberg",
        "askari",
        "e-11",
        "f-11",
      ];
      if (
        parsed.city &&
        societyNames.some((s) => parsed.city.toLowerCase().includes(s))
      ) {
        if (!parsed.addressQuery) parsed.addressQuery = parsed.city;
        parsed.city = "";
      }

      return parsed;
    } catch (error) {
      this.logger.error("❌ Filter extraction failed", error);
      return {};
    }
  }

  private async generateConversationalMessage(
    userSpeech: string,
    filters: any,
    missing: string[],
    isStopping: boolean,
    notFound: boolean,
  ): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${this.geminiApiKey}`;

    const prompt = `
      You are a friendly Real Estate Assistant for Pakistan.
      Current Filters: ${JSON.stringify(filters)}
      User Said: "${userSpeech}"
      
      SCENARIO:
      ${
        notFound
          ? "CRITICAL: We found 0 properties matching these filters. Politely tell the user you couldn't find any property matching their criteria and ask if they want to change their search (e.g., different city, lower price, or different area) or continue searching."
          : missing.length > 0
            ? `Ask for: ${missing.join(", ")}.`
            : "Tell them you are showing the results now."
      }

      LANGUAGE RULE:
      - If the "User Said" content indicates the original intent was Urdu (based on context or specific terms like 'ghr', 'lakh', 'kamray'), respond in PURE URDU SCRIPT (Nastaliq).
      - NEVER use Roman Urdu (e.g., don't write 'aap kaise hain'). Write 'آپ کیسے ہیں'.
      - If the intent was English, respond in English.
      
      Keep it under 2 sentences. Be helpful.
    `;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });
      const data: any = await response.json();
      return (
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        "Searching..."
      );
    } catch {
      return "I'm looking into that for you.";
    }
  }

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
    if (Number.isFinite(filters.floorLevel)) {
      // 0 = Ground Floor
      normalized.floorLevel = Number(filters.floorLevel);
    }
    if (["home", "hostel", "apartment"].includes(filters.hostOption))
      normalized.hostOption = filters.hostOption;
    return normalized;
  }

  private emptyResponse(message: string) {
    return { transcription: "", filters: {}, result: null, message };
  }
}
