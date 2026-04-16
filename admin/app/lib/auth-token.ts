export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: string;
  exp?: number;
  iat?: number;
}

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const decodeBase64Url = (value: string): Uint8Array => {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (padded.length % 4)) % 4;
  const binary = atob(`${padded}${"=".repeat(padLength)}`);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

const parseJsonSegment = <T>(segment: string): T | null => {
  try {
    const decoded = textDecoder.decode(decodeBase64Url(segment));
    return JSON.parse(decoded) as T;
  } catch {
    return null;
  }
};

export const verifyAuthToken = async (
  token: string | undefined,
  secret: string | undefined, // Kept for signature compatibility later
): Promise<AuthTokenPayload | null> => {
  if (!token) return null;

  const segments = token.split(".");
  if (segments.length !== 3) return null;

  // Explicitly tell TS this is our payload type
  const payload = parseJsonSegment<AuthTokenPayload>(segments[1]);

  if (!payload) {
    console.warn("VerifyAuthToken: Failed to parse payload");
    return null;
  }

  // Optional: Keep the expiry check even without signature check
  if (payload.exp && payload.exp * 1000 <= Date.now()) {
    console.warn("VerifyAuthToken: Token expired");
    return null;
  }

  return payload;
};
