export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: string;
  exp?: number;
  iat?: number;
}

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

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

const timingSafeEqual = (left: Uint8Array, right: Uint8Array) => {
  if (left.length !== right.length) {
    return false;
  }

  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left[index] ^ right[index];
  }

  return result === 0;
};

const verifyHs256Signature = async (
  encodedHeader: string,
  encodedPayload: string,
  encodedSignature: string,
  secret: string,
) => {
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    textEncoder.encode(`${encodedHeader}.${encodedPayload}`),
  );

  return timingSafeEqual(
    new Uint8Array(signature),
    decodeBase64Url(encodedSignature),
  );
};

export const verifyAuthToken = async (
  token: string | undefined,
  secret: string | undefined,
): Promise<AuthTokenPayload | null> => {
  if (!token || !secret) {
    return null;
  }

  const segments = token.split(".");
  if (segments.length !== 3) {
    return null;
  }

  const [encodedHeader, encodedPayload, encodedSignature] = segments;
  const header = parseJsonSegment<{ alg?: string; typ?: string }>(encodedHeader);
  if (!header || header.alg !== "HS256") {
    return null;
  }

  const signatureValid = await verifyHs256Signature(
    encodedHeader,
    encodedPayload,
    encodedSignature,
    secret,
  );
  if (!signatureValid) {
    return null;
  }

  const payload = parseJsonSegment<AuthTokenPayload>(encodedPayload);
  if (!payload) {
    return null;
  }

  if (payload.exp && payload.exp * 1000 <= Date.now()) {
    return null;
  }

  return payload;
};
