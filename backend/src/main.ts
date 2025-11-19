import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const PORT = 3000;
  const app = await NestFactory.create(AppModule, { cors: true });
  app.setGlobalPrefix(process.env.API_PREFIX ?? "api/v1");
  await app.listen(PORT, "0.0.0.0");
}
bootstrap().catch((err) => {
  console.error("Error during bootstrap:", err);
});
