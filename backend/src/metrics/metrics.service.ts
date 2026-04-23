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
  sumMilliseconds: number;
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
const LATENCY_BUCKET_UPPER_BOUNDS_MILLISECONDS = [
  5,
  10,
  25,
  50,
  100,
  250,
  500,
  1000,
  2000,
  5000,
  Number.POSITIVE_INFINITY,
];

@Injectable()
export class MetricsService {
  private readonly registry = new Registry();
  private readonly retainedSnapshots = new Map<number, BucketSnapshot>();

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
      buckets: LATENCY_BUCKET_UPPER_BOUNDS_MILLISECONDS
        .filter(Number.isFinite)
        .map((value) => value / 1000),
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

  async getObservabilitySummary(
    windowMinutes = RETENTION_WINDOW_MINUTES,
  ): Promise<ObservabilitySummary> {
    const aggregate = this.aggregateWindow(windowMinutes);

    return {
      windowMinutes,
      totalRequests: aggregate.requests,
      total5xxErrors: aggregate.errors5xx,
      averageLatencyMs: this.toLatencyMs(
        aggregate.latency.sumMilliseconds,
        aggregate.latency.count,
      ),
      p95LatencyMs: this.computeApproximateP95Ms(aggregate.latency.bucketCounts),
      lastUpdated: new Date().toISOString(),
    };
  }

  async getRequestVolumeSeries(
    windowMinutes = RETENTION_WINDOW_MINUTES,
  ): Promise<ObservabilityPoint[]> {
    return this.buildTimeSeries(windowMinutes, (bucket) => ({
      value: bucket?.requests ?? 0,
    }));
  }

  async getErrorSeries(
    windowMinutes = RETENTION_WINDOW_MINUTES,
  ): Promise<ObservabilityPoint[]> {
    return this.buildTimeSeries(windowMinutes, (bucket) => ({
      value: bucket?.errors5xx ?? 0,
    }));
  }

  async getLatencySeries(
    windowMinutes = RETENTION_WINDOW_MINUTES,
  ): Promise<ObservabilityPoint[]> {
    return this.buildTimeSeries(windowMinutes, (bucket) => ({
      avgLatencyMs: bucket
        ? this.toLatencyMs(
            bucket.latency.sumMilliseconds,
            bucket.latency.count,
          )
        : 0,
      p95LatencyMs: bucket
        ? this.computeApproximateP95Ms(bucket.latency.bucketCounts)
        : null,
    }));
  }

  async getTopRoutes(
    windowMinutes = RETENTION_WINDOW_MINUTES,
    limit = 15,
  ): Promise<ObservabilityRouteStats[]> {
    const aggregate = this.aggregateWindow(windowMinutes);

    return Array.from(aggregate.routes.values())
      .map((route) => ({
        method: route.method,
        route: route.route,
        requestCount: route.requests,
        errorCount: route.errors5xx,
        avgLatencyMs: this.toLatencyMs(route.sumMilliseconds, route.count),
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
    const now = Date.now();
    const bucketStart = Math.floor(now / BUCKET_DURATION_MS) * BUCKET_DURATION_MS;
    const durationMilliseconds = Math.max(0, Math.round(durationSeconds * 1000));
    const snapshot = this.getOrCreateSnapshot(bucketStart);
    const isServerError = this.is5xx(labels.status);

    snapshot.requests += 1;
    if (isServerError) {
      snapshot.errors5xx += 1;
    }
    this.addLatencyMeasurement(snapshot.latency, durationMilliseconds);

    const routeKey = `${labels.method} ${labels.route}`;
    const routeAggregate =
      snapshot.routes.get(routeKey) ||
      this.createRouteAggregate(labels.method, labels.route);

    routeAggregate.requests += 1;
    if (isServerError) {
      routeAggregate.errors5xx += 1;
    }
    this.addLatencyMeasurement(routeAggregate, durationMilliseconds);

    snapshot.routes.set(routeKey, routeAggregate);
    this.evictExpiredBuckets(now);
  }

  private getOrCreateSnapshot(bucketStart: number) {
    const existing = this.retainedSnapshots.get(bucketStart);

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

    this.retainedSnapshots.set(bucketStart, created);
    return created;
  }

  private evictExpiredBuckets(now = Date.now()) {
    const oldestAllowedBucketStart =
      Math.floor(now / BUCKET_DURATION_MS) * BUCKET_DURATION_MS -
      (RETENTION_WINDOW_MINUTES - 1) * BUCKET_DURATION_MS;

    for (const bucketStart of this.retainedSnapshots.keys()) {
      if (bucketStart < oldestAllowedBucketStart) {
        this.retainedSnapshots.delete(bucketStart);
      }
    }
  }

  private aggregateWindow(windowMinutes: number) {
    const buckets = this.loadWindowBuckets(windowMinutes);
    const aggregateLatency = this.createLatencyAccumulator();
    const routeAggregates = new Map<string, RouteAggregate>();
    let requests = 0;
    let errors5xx = 0;

    for (const bucket of buckets) {
      requests += bucket.requests;
      errors5xx += bucket.errors5xx;
      this.mergeLatencyAccumulator(aggregateLatency, bucket.latency);

      for (const [routeKey, route] of bucket.routes.entries()) {
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

  private async buildTimeSeries(
    windowMinutes: number,
    project: (
      bucket: BucketSnapshot | undefined,
    ) => Omit<ObservabilityPoint, "timestamp">,
  ): Promise<ObservabilityPoint[]> {
    const buckets = this.loadWindowBuckets(windowMinutes);
    const bucketMap = new Map(
      buckets.map((bucket) => [bucket.bucketStart, bucket] as const),
    );
    const now = Date.now();
    const currentBucketStart = Math.floor(now / BUCKET_DURATION_MS) * BUCKET_DURATION_MS;
    const points: ObservabilityPoint[] = [];
    const count = Math.max(1, Math.min(windowMinutes, RETENTION_WINDOW_MINUTES));

    for (let index = count - 1; index >= 0; index -= 1) {
      const bucketStart = currentBucketStart - index * BUCKET_DURATION_MS;
      const bucket = bucketMap.get(bucketStart);

      points.push({
        timestamp: new Date(bucketStart).toISOString(),
        ...project(bucket),
      });
    }

    return points;
  }

  private loadWindowBuckets(windowMinutes: number) {
    this.evictExpiredBuckets();
    const bucketStarts = this.getWindowBucketStarts(windowMinutes);

    return bucketStarts
      .map((bucketStart) => this.retainedSnapshots.get(bucketStart))
      .filter((bucket): bucket is BucketSnapshot => Boolean(bucket));
  }

  private getWindowBucketStarts(windowMinutes: number) {
    const count = Math.max(1, Math.min(windowMinutes, RETENTION_WINDOW_MINUTES));
    const currentBucketStart =
      Math.floor(Date.now() / BUCKET_DURATION_MS) * BUCKET_DURATION_MS;

    return Array.from({ length: count }, (_, index) => {
      const reverseIndex = count - 1 - index;
      return currentBucketStart - reverseIndex * BUCKET_DURATION_MS;
    });
  }

  private createLatencyAccumulator(): LatencyAccumulator {
    return {
      count: 0,
      sumMilliseconds: 0,
      bucketCounts: LATENCY_BUCKET_UPPER_BOUNDS_MILLISECONDS.map(() => 0),
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

  private addLatencyMeasurement(
    accumulator: LatencyAccumulator,
    durationMilliseconds: number,
  ) {
    accumulator.count += 1;
    accumulator.sumMilliseconds += durationMilliseconds;
    accumulator.bucketCounts[this.findLatencyBucketIndex(durationMilliseconds)] += 1;
  }

  private mergeLatencyAccumulator(
    target: LatencyAccumulator,
    source: LatencyAccumulator,
  ) {
    target.count += source.count;
    target.sumMilliseconds += source.sumMilliseconds;
    source.bucketCounts.forEach((count, index) => {
      target.bucketCounts[index] += count;
    });
  }

  private findLatencyBucketIndex(durationMilliseconds: number) {
    const index = LATENCY_BUCKET_UPPER_BOUNDS_MILLISECONDS.findIndex(
      (upperBound) => durationMilliseconds <= upperBound,
    );

    return index >= 0 ? index : LATENCY_BUCKET_UPPER_BOUNDS_MILLISECONDS.length - 1;
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
        const upperBound = LATENCY_BUCKET_UPPER_BOUNDS_MILLISECONDS[index];
        return Number.isFinite(upperBound) ? Number(upperBound.toFixed(2)) : null;
      }
    }

    return null;
  }

  private toLatencyMs(sumMilliseconds: number, count: number) {
    if (count === 0) {
      return 0;
    }

    return Number((sumMilliseconds / count).toFixed(2));
  }

  private is5xx(status: string) {
    return status.startsWith("5");
  }
}
