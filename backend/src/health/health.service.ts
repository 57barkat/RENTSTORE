import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";

export type DependencyStatus = "ok" | "failed";

export type HealthResponse = {
  status: "ok" | "ready" | "not_ready";
  service: "backend";
  checks?: {
    mongo: DependencyStatus;
  };
  errors?: Partial<Record<"mongo", string>>;
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

    const isReady = checks.mongo === "ok";

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
  private formatError(error: unknown) {
    return error instanceof Error ? error.message : "Unknown error";
  }
}
