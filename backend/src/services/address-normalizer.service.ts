import fetch from "node-fetch";

export async function normalizePakistaniAddress(
  rawText: string,
  apiKey: string
) {
  if (!rawText) return null;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        parts: [
          {
            text: `
You are a Pakistani address normalization engine.

Input:
"${rawText}"

Rules:
- Fix spelling mistakes
- Normalize sectors (I10 → I-10)
- Extract sector, block, phase, society, road
- Do NOT guess missing city
- Keep address human-readable

Return ONLY valid JSON:
{
  "city": string,
  "stateTerritory": string,
  "street": string,
  "normalizedAddress": string,
  "searchText": string
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

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return JSON.parse(data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}");
}
