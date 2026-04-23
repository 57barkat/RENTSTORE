import { Injectable } from "@nestjs/common";

type OtpEntry = {
  code: string;
  expiresAt: number;
};

@Injectable()
export class OtpStoreService {
  private readonly entries = new Map<string, OtpEntry>();

  async set(phone: string, code: string, ttlMs: number) {
    this.entries.set(phone, {
      code,
      expiresAt: Date.now() + ttlMs,
    });
  }

  async get(phone: string) {
    const entry = this.entries.get(phone);

    if (!entry) {
      return null;
    }

    if (entry.expiresAt <= Date.now()) {
      this.entries.delete(phone);
      return null;
    }

    return entry.code;
  }

  async delete(phone: string) {
    this.entries.delete(phone);
  }
}
