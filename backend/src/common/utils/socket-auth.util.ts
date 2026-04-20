import { Socket } from "socket.io";

const normalizeHeaderValue = (value?: string | string[]) => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

export const extractSocketToken = (client: Socket): string | null => {
  const authToken = client.handshake.auth?.token;
  if (typeof authToken === "string" && authToken.trim()) {
    return authToken.trim();
  }

  const authorizationHeader = normalizeHeaderValue(
    client.handshake.headers?.authorization,
  );
  if (authorizationHeader?.startsWith("Bearer ")) {
    const bearerToken = authorizationHeader.slice("Bearer ".length).trim();
    if (bearerToken) {
      return bearerToken;
    }
  }

  const headerToken = normalizeHeaderValue(client.handshake.headers?.token);
  if (headerToken?.trim()) {
    return headerToken.trim();
  }

  return null;
};
