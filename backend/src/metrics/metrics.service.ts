import { Injectable } from "@nestjs/common";
import { Counter, Histogram, Registry } from "prom-client";

type HttpMetricLabelName = "method" | "route" | "status";

type HttpMetricLabels = {
  method: string;
  route: string;
  status: string;
};

type LatencyAccumulator = {
  count: number;
  sumSeconds: number;
  bucketCounts: number[];
};

type RouteAggregate = LatencyAccumulator & {
  method: string;
  route: string;
  requests: number;
  errors5xx: number;
};

type BucketSnapshot = {
  bucketStart: number;
  requests: number;
  errors5xx: number;
  latency: LatencyAccumulator;
  routes: Map<string, RouteAggregate>;
};

export type ObservabilityPoint = {
  timestamp: string;
  value?: number;
  avgLatencyMs?: number;
  p95LatencyMs?: number | null;
};

export type ObservabilityRouteStats = {
  method: string;
  route: string;
  requestCount: number;
  errorCount: number;
  avgLatencyMs: number;
  p95LatencyMs: number | null;
};

export type ObservabilitySummary = {
  windowMinutes: number;
  totalRequests: number;
  total5xxErrors: number;
  averageLatencyMs: number;
  p95LatencyMs: number | null;
  lastUpdated: string;
};

const BUCKET_DURATION_MS = 60_000;
const RETENTION_WINDOW_MINUTES = 60;
const MAX_BUCKETS = RETENTION_WINDOW_MINUTES + 2;
const LATENCY_BUCKET_UPPER_BOUNDS_SECONDS = [
  0.005,
  0.01,
  0.025,
  0.05,
  0.1,
  0.25,
  0.5,
  1,
  2,
  5,
  Number.POSITIVE_INFINITY,
];

@Injectable()
export class MetricsService {
  private readonly registry = new Registry();
  private readonly snapshots = new Map<number, BucketSnapshot>();
  private lastCleanupAt = 0;

  private readonly httpRequestsTotal = new Counter<HttpMetricLabelName>({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status"],
    registers: [this.registry],
  });

  private readonly httpRequestDurationSeconds =
    new Histogram<HttpMetricLabelName>({
      name: "http_request_duration_seconds",
      help: "HTTP request duration in seconds",
      labelNames: ["method", "route", "status"],
      buckets: LATENCY_BUCKET_UPPER_BOUNDS_SECONDS.filter(Number.isFinite),
      registers: [this.registry],
    });

  recordHttpRequest(labels: HttpMetricLabels, durationSeconds: number) {
    this.httpRequestsTotal.inc(labels);
    this.httpRequestDurationSeconds.observe(labels, durationSeconds);
    this.recordSnapshot(labels, durationSeconds);
  }

  getContentType() {
    return this.registry.contentType;
  }

  async getMetrics() {
    return this.registry.metrics();
  }

  getObservabilitySummary(windowMinutes = RETENTION_WINDOW_MINUTES): ObservabilitySummary {
    const aggregate = this.aggregateWindow(windowMinutes);

    return {
      windowMinutes,
      totalRequests: aggregate.requests,
      total5xxErrors: aggregate.errors5xx,
      averageLatencyMs: this.toLatencyMs(aggregate.latency.sumSeconds, aggregate.latency.count),
      p95LatencyMs: this.computeApproximateP95Ms(aggregate.latency.bucketCounts),
      lastUpdated: new Date().toISOString(),
    };
  }

  getRequestVolumeSeries(windowMinutes = RETENTION_WINDOW_MINUTES): ObservabilityPoint[] {
    return this.buildTimeSeries(windowMinutes, (bucket) => ({
      value: bucket?.requests ?? 0,
    }));
  }

  getErrorSeries(windowMinutes = RETENTION_WINDOW_MINUTES): ObservabilityPoint[] {
    return this.buildTimeSeries(windowMinutes, (bucket) => ({
      value: bucket?.errors5xx ?? 0,
    }));
  }

  getLatencySeries(windowMinutes = RETENTION_WINDOW_MINUTES): ObservabilityPoint[] {
    return this.buildTimeSeries(windowMinutes, (bucket) => ({
      avgLatencyMs: bucket
        ? this.toLatencyMs(bucket.latency.sumSeconds, bucket.latency.count)
        : 0,
      p95LatencyMs: bucket
        ? this.computeApproximateP95Ms(bucket.latency.bucketCounts)
        : null,
    }));
  }

  getTopRoutes(windowMinutes = RETENTION_WINDOW_MINUTES, limit = 15): ObservabilityRouteStats[] {
    const aggregate = this.aggregateWindow(windowMinutes);

    return Array.from(aggregate.routes.values())
      .map((route) => ({
        method: route.method,
        route: route.route,
        requestCount: route.requests,
        errorCount: route.errors5xx,
        avgLatencyMs: this.toLatencyMs(route.sumSeconds, route.count),
        p95LatencyMs: this.computeApproximateP95Ms(route.bucketCounts),
      }))
      .sort((left, right) => {
        if (right.requestCount !== left.requestCount) {
          return right.requestCount - left.requestCount;
        }

        if (right.errorCount !== left.errorCount) {
          return right.errorCount - left.errorCount;
        }

        return right.avgLatencyMs - left.avgLatencyMs;
      })
      .slice(0, limit);
  }

  private recordSnapshot(labels: HttpMetricLabels, durationSeconds: number) {
    this.cleanupSnapshotsIfNeeded();

    const now = Date.now();
    const bucketStart = Math.floor(now / BUCKET_DURATION_MS) * BUCKET_DURATION_MS;
    const snapshot = this.getOrCreateSnapshot(bucketStart);
    const isServerError = this.is5xx(labels.status);

    snapshot.requests += 1;
    if (isServerError) {
      snapshot.errors5xx += 1;
    }
    this.addLatencyMeasurement(snapshot.latency, durationSeconds);

    const routeKey = `${labels.method} ${labels.route}`;
    const routeAggregate =
      snapshot.routes.get(routeKey) ||
      this.createRouteAggregate(labels.method, labels.route);

    routeAggregate.requests += 1;
    if (isServerError) {
      routeAggregate.errors5xx += 1;
    }
    this.addLatencyMeasurement(routeAggregate, durationSeconds);

    snapshot.routes.set(routeKey, routeAggregate);
  }

  private aggregateWindow(windowMinutes: number) {
    const cutoff = Date.now() - windowMinutes * BUCKET_DURATION_MS;
    const aggregateLatency = this.createLatencyAccumulator();
    const routeAggregates = new Map<string, RouteAggregate>();
    let requests = 0;
    let errors5xx = 0;

    for (const snapshot of this.snapshots.values()) {
      if (snapshot.bucketStart < cutoff) {
        continue;
      }

      requests += snapshot.requests;
      errors5xx += snapshot.errors5xx;
      this.mergeLatencyAccumulator(aggregateLatency, snapshot.latency);

      for (const [routeKey, route] of snapshot.routes.entries()) {
        const existing =
          routeAggregates.get(routeKey) ||
          this.createRouteAggregate(route.method, route.route);

        existing.requests += route.requests;
        existing.errors5xx += route.errors5xx;
        this.mergeLatencyAccumulator(existing, route);
        routeAggregates.set(routeKey, existing);
      }
    }

    return {
      requests,
      errors5xx,
      latency: aggregateLatency,
      routes: routeAggregates,
    };
  }

  private buildTimeSeries(
    windowMinutes: number,
    project: (bucket: BucketSnapshot | undefined) => Omit<ObservabilityPoint, "timestamp">,
  ): ObservabilityPoint[] {
    const now = Date.now();
    const currentBucketStart = Math.floor(now / BUCKET_DURATION_MS) * BUCKET_DURATION_MS;
    const points: ObservabilityPoint[] = [];

    for (let index = windowMinutes - 1; index >= 0; index -= 1) {
      const bucketStart = currentBucketStart - index * BUCKET_DURATION_MS;
      const bucket = this.snapshots.get(bucketStart);

      points.push({
        timestamp: new Date(bucketStart).toISOString(),
        ...project(bucket),
      });
    }

    return points;
  }

  private getOrCreateSnapshot(bucketStart: number): BucketSnapshot {
    const existing = this.snapshots.get(bucketStart);

    if (existing) {
      return existing;
    }

    const created: BucketSnapshot = {
      bucketStart,
      requests: 0,
      errors5xx: 0,
      latency: this.createLatencyAccumulator(),
      routes: new Map(),
    };

    this.snapshots.set(bucketStart, created);
    return created;
  }

  private cleanupSnapshotsIfNeeded() {
    const now = Date.now();

    if (now - this.lastCleanupAt < BUCKET_DURATION_MS) {
      return;
    }

    this.lastCleanupAt = now;
    const cutoff = now - MAX_BUCKETS * BUCKET_DURATION_MS;

    for (const bucketStart of this.snapshots.keys()) {
      if (bucketStart < cutoff) {
        this.snapshots.delete(bucketStart);
      }
    }
  }

  private createLatencyAccumulator(): LatencyAccumulator {
    return {
      count: 0,
      sumSeconds: 0,
      bucketCounts: LATENCY_BUCKET_UPPER_BOUNDS_SECONDS.map(() => 0),
    };
  }

  private createRouteAggregate(method: string, route: string): RouteAggregate {
    return {
      method,
      route,
      requests: 0,
      errors5xx: 0,
      ...this.createLatencyAccumulator(),
    };
  }

  private addLatencyMeasurement(accumulator: LatencyAccumulator, durationSeconds: number) {
    accumulator.count += 1;
    accumulator.sumSeconds += durationSeconds;
    accumulator.bucketCounts[this.findLatencyBucketIndex(durationSeconds)] += 1;
  }

  private mergeLatencyAccumulator(
    target: LatencyAccumulator,
    source: LatencyAccumulator,
  ) {
    target.count += source.count;
    target.sumSeconds += source.sumSeconds;
    source.bucketCounts.forEach((count, index) => {
      target.bucketCounts[index] += count;
    });
  }

  private findLatencyBucketIndex(durationSeconds: number) {
    const index = LATENCY_BUCKET_UPPER_BOUNDS_SECONDS.findIndex(
      (upperBound) => durationSeconds <= upperBound,
    );

    return index >= 0 ? index : LATENCY_BUCKET_UPPER_BOUNDS_SECONDS.length - 1;
  }

  private computeApproximateP95Ms(bucketCounts: number[]) {
    const total = bucketCounts.reduce((sum, value) => sum + value, 0);

    if (total === 0) {
      return null;
    }

    const threshold = total * 0.95;
    let runningTotal = 0;

    for (let index = 0; index < bucketCounts.length; index += 1) {
      runningTotal += bucketCounts[index];

      if (runningTotal >= threshold) {
        const upperBound = LATENCY_BUCKET_UPPER_BOUNDS_SECONDS[index];
        return Number.isFinite(upperBound) ? Number((upperBound * 1000).toFixed(2)) : null;
      }
    }

    return null;
  }

  private toLatencyMs(sumSeconds: number, count: number) {
    if (count === 0) {
      return 0;
    }

    return Number(((sumSeconds / count) * 1000).toFixed(2));
  }

  private is5xx(status: string) {
    return status.startsWith("5");
  }
}
