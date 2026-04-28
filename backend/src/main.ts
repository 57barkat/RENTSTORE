import "./instrument";
import "dotenv/config";
import * as Sentry from "@sentry/nestjs";
import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { json, urlencoded } from "express";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { createCorsOptions } from "./common/utils/cors.util";

function stripDangerousMongoKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => stripDangerousMongoKeys(item));
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.entries(value as Record<string, unknown>).reduce(
    (accumulator, [key, nestedValue]) => {
      if (key.startsWith("$") || key.includes(".")) {
        return accumulator;
      }

      accumulator[key] = stripDangerousMongoKeys(nestedValue);
      return accumulator;
    },
    {} as Record<string, unknown>,
  );
}

function sanitizeObjectInPlace(value: unknown): unknown {
  const sanitized = stripDangerousMongoKeys(value);

  if (
    value &&
    sanitized &&
    typeof value === "object" &&
    typeof sanitized === "object" &&
    !Array.isArray(value) &&
    !Array.isArray(sanitized)
  ) {
    const target = value as Record<string, unknown>;
    const source = sanitized as Record<string, unknown>;

    for (const key of Object.keys(target)) {
      delete target[key];
    }

    Object.assign(target, source);
    return target;
  }

  return sanitized;
}

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const appConfig = configService.get<Record<string, any>>("app", {
    infer: true,
  });

  if (appConfig?.trustProxy) {
    app.set("trust proxy", 1);
  }

  app.use(json({ limit: appConfig?.jsonBodyLimit ?? "1mb" }));
  app.use(
    urlencoded({
      extended: true,
      limit: appConfig?.urlencodedBodyLimit ?? "1mb",
    }),
  );
  app.use(cookieParser());
  app.use((_req, res, next) => {
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
    next();
  });
  app.use((req, _res, next) => {
    req.body = sanitizeObjectInPlace(req.body);
    sanitizeObjectInPlace(req.query);
    next();
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.enableShutdownHooks();

  const port = appConfig?.port ?? process.env.PORT ?? 3000;

  app.setGlobalPrefix(
    appConfig?.apiPrefix ?? process.env.API_PREFIX ?? "api/v1",
  );
  app.enableCors(createCorsOptions(appConfig?.corsOrigins ?? []));

  await app.listen(port, "0.0.0.0");

  logger.log(`Server running on port ${port}`);
}

bootstrap().catch(async (err) => {
  const logger = new Logger("Bootstrap");
  logger.error("Error during bootstrap", err);

  Sentry.captureException(err);
  await Sentry.flush(2000);

  process.exit(1);
});
