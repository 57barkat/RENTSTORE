import { Injectable, OnModuleDestroy } from "@nestjs/common";

interface RateLimitRecord {
  count: number;
  expiresAt: number;
}

@Injectable()
export class RequestRateLimitService implements OnModuleDestroy {
  private readonly records = new Map<string, RateLimitRecord>();
  private readonly cleanupTimer = setInterval(() => this.cleanupExpired(), 30_000);

  constructor() {
    this.cleanupTimer.unref?.();
  }

  async consume(key: string, windowMs: number) {
    const now = Date.now();
    const existing = this.records.get(key);

    if (!existing || existing.expiresAt <= now) {
      const nextRecord = {
        count: 1,
        expiresAt: now + windowMs,
      };
      this.records.set(key, nextRecord);
      return nextRecord;
    }

    existing.count += 1;
    return existing;
  }

  onModuleDestroy() {
    clearInterval(this.cleanupTimer);
  }

  private cleanupExpired() {
    const now = Date.now();

    for (const [key, record] of this.records.entries()) {
      if (record.expiresAt <= now) {
        this.records.delete(key);
      }
    }
  }
}
