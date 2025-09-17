// src/config/database.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('database', (): { uri: string; dbName: string } => ({
  uri: process.env.MONGO_URI!,
  dbName: process.env.MONGO_DB_NAME!,
}));
