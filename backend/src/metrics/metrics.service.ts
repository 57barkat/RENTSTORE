import { Injectable } from "@nestjs/common";
import { Counter, Histogram, Registry } from "prom-client";

type HttpMetricLabelName = "method" | "route" | "status";

type HttpMetricLabels = {
  method: string;
  route: string;
  status: string;
};

@Injectable()
export class MetricsService {
  private readonly registry = new Registry();

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
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
      registers: [this.registry],
    });

  recordHttpRequest(labels: HttpMetricLabels, durationSeconds: number) {
    this.httpRequestsTotal.inc(labels);
    this.httpRequestDurationSeconds.observe(labels, durationSeconds);
  }

  getContentType() {
    return this.registry.contentType;
  }

  async getMetrics() {
    return this.registry.metrics();
  }
}
