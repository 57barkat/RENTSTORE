import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

interface AttemptRecord {
  count: number;
  firstAttempt: number; // timestamp
}

@Injectable()
export class SignupThrottleMiddleware implements NestMiddleware {
  private attempts: Map<string, AttemptRecord> = new Map();

  private readonly MAX_ATTEMPTS = 3;
  private readonly BLOCK_TIME = 12 * 60 * 60 * 1000; 

  use(req: Request, res: Response, next: NextFunction) {
    if (req.method === "POST" && req.path.includes("/users/signup")) {
      const phone = req.body?.phone;
      const ip = req.ip;

      if (!phone) {
        throw new BadRequestException("Phone number is required");
      }

      const key = `${phone}_${ip}`;
      const now = Date.now();

      let record = this.attempts.get(key);

      if (record) {
        if (
          record.count >= this.MAX_ATTEMPTS &&
          now - record.firstAttempt < this.BLOCK_TIME
        ) {
          throw new BadRequestException(
            "Too many signup attempts. Try again later."
          );
        }

        // reset if 12 hours passed
        if (now - record.firstAttempt >= this.BLOCK_TIME) {
          record = { count: 0, firstAttempt: now };
        }
      } else {
        record = { count: 0, firstAttempt: now };
      }

      record.count++;
      this.attempts.set(key, record);
    }

    next();
  }
}
