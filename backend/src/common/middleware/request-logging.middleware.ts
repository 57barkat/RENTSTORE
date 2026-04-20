import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger("HTTP");

  use(req: Request, res: Response, next: NextFunction) {
    const startedAt = Date.now();
    const requestId =
      typeof req.headers["x-request-id"] === "string"
        ? req.headers["x-request-id"]
        : randomUUID();

    res.setHeader("x-request-id", requestId);

    res.on("finish", () => {
      this.logger.log(
        JSON.stringify({
          requestId,
          method: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode,
          durationMs: Date.now() - startedAt,
          ip: req.ip,
          userAgent: req.get("user-agent"),
        }),
      );
    });

    next();
  }
}
