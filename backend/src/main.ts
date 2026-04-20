import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { json, urlencoded } from "express";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { createCorsOptions } from "./common/utils/cors.util";

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
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
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

bootstrap().catch((err) => {
  const logger = new Logger("Bootstrap");
  logger.error("Error during bootstrap", err);
});
