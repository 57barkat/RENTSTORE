import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
 
  const PORT = process.env.PORT || 3000;
 
  app.setGlobalPrefix(process.env.API_PREFIX ?? "api/v1");
 
  await app.listen(PORT, "0.0.0.0");

  console.log(`🚀 Server running on port ${PORT}`);
}

bootstrap().catch((err) => {
  console.error("Error during bootstrap:", err);
});
