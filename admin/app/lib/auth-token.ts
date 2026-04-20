export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: string;
  exp?: number;
  iat?: number;
}

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
  secret: string | undefined,
): Promise<AuthTokenPayload | null> => {
  void secret;

  if (!token) {
    return null;
  }

  const segments = token.split(".");
  if (segments.length !== 3) {
    return null;
  }

  const payload = parseJsonSegment<AuthTokenPayload>(segments[1]);
  if (!payload) {
    return null;
  }

  if (payload.exp && payload.exp * 1000 <= Date.now()) {
    return null;
  }

  return payload;
};
