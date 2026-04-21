import { Injectable } from "@nestjs/common";
import { getRedis } from "../common/redis/redis.service";

interface RateLimitRecord {
  count: number;
  expiresAt: number;
}

const CONSUME_RATE_LIMIT_SCRIPT = `
local current = redis.call("INCR", KEYS[1])
local ttl = redis.call("PTTL", KEYS[1])

if current == 1 or ttl < 0 then
  redis.call("PEXPIRE", KEYS[1], ARGV[1])
  ttl = tonumber(ARGV[1])
end

return { current, ttl }
`;

@Injectable()
export class RequestRateLimitService {
  async consume(key: string, windowMs: number): Promise<RateLimitRecord> {
    const ttlMs = Math.max(1, Math.floor(windowMs));
    const [count, ttl] = await getRedis().eval<[number], [number, number]>(
      CONSUME_RATE_LIMIT_SCRIPT,
      [key],
      [ttlMs],
    );

    const remainingTtl = typeof ttl === "number" && ttl > 0 ? ttl : ttlMs;

    return {
      count: Number(count) || 0,
      expiresAt: Date.now() + remainingTtl,
    };
  }
}
