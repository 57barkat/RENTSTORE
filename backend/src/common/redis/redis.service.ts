import "dotenv/config";
import { Redis } from "@upstash/redis";

let redisClient: Redis | null = null;

export function getRedis(): Redis {
  if (redisClient) {
    return redisClient;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      "Upstash Redis is not configured. Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN.",
    );
  }

  redisClient = new Redis({ url, token });
  return redisClient;
}
