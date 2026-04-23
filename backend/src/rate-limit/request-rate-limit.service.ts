import { Injectable } from "@nestjs/common";

interface RateLimitRecord {
  count: number;
  expiresAt: number;
}

@Injectable()
export class RequestRateLimitService {
  private readonly entries = new Map<string, RateLimitRecord>();

  async consume(key: string, windowMs: number): Promise<RateLimitRecord> {
    const ttlMs = Math.max(1, Math.floor(windowMs));
    const now = Date.now();
    const existing = this.entries.get(key);

    if (!existing || existing.expiresAt <= now) {
      const record = {
        count: 1,
        expiresAt: now + ttlMs,
      };
      this.entries.set(key, record);
      return record;
    }

    const record = {
      count: existing.count + 1,
      expiresAt: existing.expiresAt,
    };
    this.entries.set(key, record);

    return record;
  }
}
