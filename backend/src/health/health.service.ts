import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { getRedis } from "../common/redis/redis.service";

export type DependencyStatus = "ok" | "failed";

export type HealthResponse = {
  status: "ok" | "ready" | "not_ready";
  service: "backend";
  checks?: {
    mongo: DependencyStatus;
    redis: DependencyStatus;
  };
  errors?: Partial<Record<"mongo" | "redis", string>>;
  timestamp: string;
};

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
  ) {}

  getLiveness(): HealthResponse {
    return {
      status: "ok",
      service: "backend",
      timestamp: new Date().toISOString(),
    };
  }

  async getReadiness(): Promise<{ statusCode: number; body: HealthResponse }> {
    const checks: HealthResponse["checks"] = {
      mongo: "failed",
      redis: "failed",
    };
    const errors: NonNullable<HealthResponse["errors"]> = {};

    try {
      await this.checkMongo();
      checks.mongo = "ok";
    } catch (error) {
      const message = this.formatError(error);
      errors.mongo = message;
      this.logger.warn(`Health check failed for MongoDB: ${message}`);
    }

    try {
      await this.checkRedis();
      checks.redis = "ok";
    } catch (error) {
      const message = this.formatError(error);
      errors.redis = message;
      this.logger.warn(`Health check failed for Redis: ${message}`);
    }

    const isReady = checks.mongo === "ok" && checks.redis === "ok";

    return {
      statusCode: isReady ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE,
      body: {
        status: isReady ? "ready" : "not_ready",
        service: "backend",
        checks,
        ...(Object.keys(errors).length > 0 ? { errors } : {}),
        timestamp: new Date().toISOString(),
      },
    };
  }

  async getHealthDetails() {
    const liveness = this.getLiveness();
    const readiness = await this.getReadiness();

    return {
      liveness,
      readiness: readiness.body,
      readinessStatusCode: readiness.statusCode,
      timestamp: new Date().toISOString(),
    };
  }

  private async checkMongo() {
    if (this.connection.readyState !== 1 || !this.connection.db) {
      throw new Error("Mongo connection is not ready");
    }

    await this.connection.db.admin().ping();
  }

  private async checkRedis() {
    const result = await getRedis().ping();

    if (typeof result !== "string" || result.toUpperCase() !== "PONG") {
      throw new Error(`Unexpected Redis ping response: ${String(result)}`);
    }
  }

  private formatError(error: unknown) {
    return error instanceof Error ? error.message : "Unknown error";
  }
}
