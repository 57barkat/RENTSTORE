import "dotenv/config";

type CorsOriginCallback = (err: Error | null, allow?: boolean) => void;

export const parseCorsOrigins = (value?: string | string[]): string[] => {
  if (Array.isArray(value)) {
    return value.map((origin) => origin.trim()).filter(Boolean);
  }

  return (value ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

export const createCorsOriginValidator = (allowedOrigins: string[] = []) => {
  const allowAllOrigins = allowedOrigins.includes("*");

  return (origin: string | undefined, callback: CorsOriginCallback) => {
    // Native mobile apps, curl, and server-side calls often omit Origin.
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowAllOrigins || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Origin not allowed by CORS"), false);
  };
};

export const createCorsOptions = (allowedOrigins: string[] = []) => ({
  origin: createCorsOriginValidator(allowedOrigins),
  credentials: true,
});

export const createSocketGatewayOptions = (allowedOrigins?: string[]) => ({
  cors: createCorsOptions(
    allowedOrigins ?? parseCorsOrigins(process.env.CORS_ORIGINS),
  ),
});
