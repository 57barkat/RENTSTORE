import { Injectable } from "@nestjs/common";

type CachedUserAuthSnapshot = {
  id: string;
  email: string;
  role: string;
  isBlocked: boolean;
};

interface CacheEntry {
  value: CachedUserAuthSnapshot | null;
  expiresAt: number;
}

@Injectable()
export class AuthUserCacheService {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly ttlMs = 60_000;

  get(userId: string): CachedUserAuthSnapshot | null | undefined {
    const entry = this.cache.get(userId);
    if (!entry) {
      return undefined;
    }

    if (entry.expiresAt <= Date.now()) {
      this.cache.delete(userId);
      return undefined;
    }

    return entry.value;
  }

  set(userId: string, value: CachedUserAuthSnapshot | null) {
    this.cache.set(userId, {
      value,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  invalidate(userId: string) {
    this.cache.delete(userId);
  }
}
