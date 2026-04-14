import { registerAs } from "@nestjs/config";

export default registerAs("database", () => ({
  uri: process.env.MONGO_URI!,
  dbName: process.env.MONGO_DB_NAME || undefined,
  maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE ?? "100", 10),
  minPoolSize: parseInt(process.env.MONGO_MIN_POOL_SIZE ?? "5", 10),
  serverSelectionTimeoutMS: parseInt(
    process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS ?? "5000",
    10,
  ),
  socketTimeoutMS: parseInt(process.env.MONGO_SOCKET_TIMEOUT_MS ?? "45000", 10),
  autoIndex: process.env.NODE_ENV !== "production",
}));
