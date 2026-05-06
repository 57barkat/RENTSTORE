import { registerAs } from "@nestjs/config";

export default registerAs("app", (): Record<string, any> => {
  const corsOriginsRaw = process.env.CORS_ORIGINS ?? "";
  const corsOrigins = corsOriginsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    env: process.env.NODE_ENV ?? "development",
    port: parseInt(process.env.PORT ?? "3000", 10),
    apiPrefix: process.env.API_PREFIX ?? "api/v1",
    corsOrigins,
    trustProxy: process.env.TRUST_PROXY === "true",
    jsonBodyLimit: process.env.JSON_BODY_LIMIT ?? "1mb",
    urlencodedBodyLimit: process.env.URLENCODED_BODY_LIMIT ?? "1mb",
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "15m",
    jwtRefreshSecret:
      process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET,
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
  };
});
