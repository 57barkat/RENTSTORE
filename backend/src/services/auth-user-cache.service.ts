import { Injectable } from "@nestjs/common";
import { getRedis } from "../common/redis/redis.service";

type CachedUserAuthSnapshot = {
  id: string;
  email: string;
  role: string;
  isBlocked: boolean;
};

@Injectable()
export class AuthUserCacheService {
  private readonly ttlMs = 60_000;

  async get(userId: string): Promise<CachedUserAuthSnapshot | null | undefined> {
    const entry = await getRedis().get<string>(this.getKey(userId));
    if (!entry) {
      return undefined;
    }

    try {
      return JSON.parse(entry) as CachedUserAuthSnapshot | null;
    } catch {
      return undefined;
    }
  }

  async set(userId: string, value: CachedUserAuthSnapshot | null) {
    await getRedis().set(this.getKey(userId), JSON.stringify(value), {
      px: this.ttlMs,
    });
  }

  async invalidate(userId: string) {
    await getRedis().del(this.getKey(userId));
  }

  private getKey(userId: string) {
    return `auth:user-cache:${userId}`;
  }
}
