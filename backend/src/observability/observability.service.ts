import { Injectable } from "@nestjs/common";
import { HealthService } from "../health/health.service";
import {
  MetricsService,
  type ObservabilityPoint,
  type ObservabilityRouteStats,
  type ObservabilitySummary,
} from "../metrics/metrics.service";

type SummaryResponse = {
  totalRequests: number;
  total5xxErrors: number;
  averageLatencyMs: number;
  p95LatencyMs: number | null;
  health: {
    live: string;
    ready: string;
  };
  lastUpdated: string;
  windowMinutes: number;
};

type PointsResponse = {
  points: ObservabilityPoint[];
  lastUpdated: string;
  windowMinutes: number;
};

type RoutesResponse = {
  routes: ObservabilityRouteStats[];
  lastUpdated: string;
  windowMinutes: number;
  limitation: string;
};

type HealthDetailsResponse = {
  liveness: {
    status: string;
    service: string;
    timestamp: string;
  };
  readiness: {
    status: string;
    service: string;
    checks?: {
      mongo: string;
    };
    errors?: Partial<Record<"mongo", string>>;
    timestamp: string;
  };
  timestamp: string;
};

type CachedPayload =
  | SummaryResponse
  | PointsResponse
  | RoutesResponse
  | HealthDetailsResponse;

const WINDOW_MINUTES = 60;
const CACHE_TTL_MS = 10_000;
const SNAPSHOT_LIMITATION =
  "Time-bucketed observability metrics are retained in process memory for the recent rolling window.";

@Injectable()
export class ObservabilityService {
  private readonly cache = new Map<
    string,
    { expiresAt: number; payload: CachedPayload }
  >();

  constructor(
    private readonly metricsService: MetricsService,
    private readonly healthService: HealthService,
  ) {}

  async getSummary(): Promise<SummaryResponse> {
    return this.fromCache("summary", async () => {
      const summary =
        await this.metricsService.getObservabilitySummary(WINDOW_MINUTES);
      const health = await this.healthService.getHealthDetails();

      return {
        totalRequests: summary.totalRequests,
        total5xxErrors: summary.total5xxErrors,
        averageLatencyMs: summary.averageLatencyMs,
        p95LatencyMs: summary.p95LatencyMs,
        health: {
          live: health.liveness.status,
          ready: health.readiness.status,
        },
        lastUpdated: summary.lastUpdated,
        windowMinutes: summary.windowMinutes,
      };
    });
  }

  async getRequestsOverTime(): Promise<PointsResponse> {
    return this.fromCache("requests-over-time", async () => ({
      points: await this.metricsService.getRequestVolumeSeries(WINDOW_MINUTES),
      lastUpdated: new Date().toISOString(),
      windowMinutes: WINDOW_MINUTES,
    }));
  }

  async getErrorsOverTime(): Promise<PointsResponse> {
    return this.fromCache("errors-over-time", async () => ({
      points: await this.metricsService.getErrorSeries(WINDOW_MINUTES),
      lastUpdated: new Date().toISOString(),
      windowMinutes: WINDOW_MINUTES,
    }));
  }

  async getLatencyOverTime(): Promise<PointsResponse> {
    return this.fromCache("latency-over-time", async () => ({
      points: await this.metricsService.getLatencySeries(WINDOW_MINUTES),
      lastUpdated: new Date().toISOString(),
      windowMinutes: WINDOW_MINUTES,
    }));
  }

  async getRoutes(): Promise<RoutesResponse> {
    return this.fromCache("routes", async () => ({
      routes: await this.metricsService.getTopRoutes(WINDOW_MINUTES),
      lastUpdated: new Date().toISOString(),
      windowMinutes: WINDOW_MINUTES,
      limitation: SNAPSHOT_LIMITATION,
    }));
  }

  async getHealth(): Promise<HealthDetailsResponse> {
    return this.fromCache("health", async () => {
      const health = await this.healthService.getHealthDetails();

      return {
        liveness: health.liveness,
        readiness: health.readiness,
        timestamp: health.timestamp,
      };
    });
  }

  private async fromCache<T extends CachedPayload>(
    key: string,
    factory: () => Promise<T>,
  ): Promise<T> {
    const cached = this.cache.get(key);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.payload as T;
    }

    const payload = await factory();
    this.cache.set(key, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      payload,
    });

    return payload;
  }
}
