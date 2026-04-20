import {
  createCorsOriginValidator,
  parseCorsOrigins,
} from "./cors.util";

describe("cors.util", () => {
  it("parses comma-separated origins", () => {
    expect(
      parseCorsOrigins("http://localhost:3000, https://app.example.com "),
    ).toEqual(["http://localhost:3000", "https://app.example.com"]);
  });

  it("allows requests without an origin header", () => {
    const validator = createCorsOriginValidator(["https://app.example.com"]);

    validator(undefined, (err, allowed) => {
      expect(err).toBeNull();
      expect(allowed).toBe(true);
    });
  });

  it("allows configured browser origins", () => {
    const validator = createCorsOriginValidator(["https://app.example.com"]);

    validator("https://app.example.com", (err, allowed) => {
      expect(err).toBeNull();
      expect(allowed).toBe(true);
    });
  });

  it('treats "*" as allow-all', () => {
    const validator = createCorsOriginValidator(["*"]);

    validator("https://random-origin.example.com", (err, allowed) => {
      expect(err).toBeNull();
      expect(allowed).toBe(true);
    });
  });

  it("rejects unconfigured browser origins", () => {
    const validator = createCorsOriginValidator(["https://app.example.com"]);

    validator("https://evil.example.com", (err, allowed) => {
      expect(err).toBeInstanceOf(Error);
      expect(err?.message).toBe("Origin not allowed by CORS");
      expect(allowed).toBe(false);
    });
  });
});
