import { Injectable } from "@nestjs/common";

type CachedUserAuthSnapshot = {
  id: string;
  email: string;
  role: string;
  isBlocked: boolean;
};

type CacheEntry = {
  value: CachedUserAuthSnapshot | null;
  expiresAt: number;
};

@Injectable()
export class AuthUserCacheService {
  private readonly ttlMs = 60_000;
  private readonly entries = new Map<string, CacheEntry>();

  async get(userId: string): Promise<CachedUserAuthSnapshot | null | undefined> {
    const entry = this.entries.get(this.getKey(userId));
    if (!entry) {
      return undefined;
    }

    if (entry.expiresAt <= Date.now()) {
      this.entries.delete(this.getKey(userId));
      return undefined;
    }

    return entry.value;
  }

  async set(userId: string, value: CachedUserAuthSnapshot | null) {
    this.entries.set(this.getKey(userId), {
      value,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  async invalidate(userId: string) {
    this.entries.delete(this.getKey(userId));
  }

  private getKey(userId: string) {
    return `auth:user-cache:${userId}`;
  }
}
