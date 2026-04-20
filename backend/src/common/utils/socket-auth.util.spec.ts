import { extractSocketToken } from "./socket-auth.util";

describe("socket-auth.util", () => {
  it("prefers the socket auth token", () => {
    const token = extractSocketToken({
      handshake: {
        auth: { token: "auth-token" },
        headers: {},
      },
    } as any);

    expect(token).toBe("auth-token");
  });

  it("falls back to bearer authorization headers", () => {
    const token = extractSocketToken({
      handshake: {
        auth: {},
        headers: {
          authorization: "Bearer header-token",
        },
      },
    } as any);

    expect(token).toBe("header-token");
  });

  it("falls back to the legacy token header", () => {
    const token = extractSocketToken({
      handshake: {
        auth: {},
        headers: {
          token: "legacy-token",
        },
      },
    } as any);

    expect(token).toBe("legacy-token");
  });

  it("returns null when no token is present", () => {
    const token = extractSocketToken({
      handshake: {
        auth: {},
        headers: {},
      },
    } as any);

    expect(token).toBeNull();
  });
});
