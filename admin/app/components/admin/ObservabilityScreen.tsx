"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Clock3,
  HeartPulse,
  RefreshCw,
  Route as RouteIcon,
  ServerCrash,
  TimerReset,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import apiClient from "@/app/lib/api-client";

export type ObservabilitySummaryResponse = {
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

export type ObservabilityPoint = {
  timestamp: string;
  value?: number;
  avgLatencyMs?: number;
  p95LatencyMs?: number | null;
};

export type ObservabilitySeriesResponse = {
  points: ObservabilityPoint[];
  lastUpdated: string;
  windowMinutes: number;
};

export type ObservabilityRouteRow = {
  method: string;
  route: string;
  requestCount: number;
  errorCount: number;
  avgLatencyMs: number;
  p95LatencyMs: number | null;
};

export type ObservabilityRoutesResponse = {
  routes: ObservabilityRouteRow[];
  lastUpdated: string;
  windowMinutes: number;
  limitation: string;
};

export type ObservabilityHealthResponse = {
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
      redis: string;
    };
    errors?: Partial<Record<"mongo" | "redis", string>>;
    timestamp: string;
  };
  timestamp: string;
};

export type ObservabilityPayload = {
  summary: ObservabilitySummaryResponse;
  requests: ObservabilitySeriesResponse;
  errors: ObservabilitySeriesResponse;
  latency: ObservabilitySeriesResponse;
  routes: ObservabilityRoutesResponse;
  health: ObservabilityHealthResponse;
};

const formatCompactNumber = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value);
};

const formatLatency = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    return "n/a";
  }

  return `${value.toFixed(value >= 100 ? 0 : 1)} ms`;
};

const formatTimestampLabel = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const buildChartTooltipLabel = (timestamp: string) => {
  return new Date(timestamp).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

async function fetchObservabilityPayload(): Promise<ObservabilityPayload> {
  const [summary, requests, errors, latency, routes, health] = await Promise.all([
    apiClient.get<ObservabilitySummaryResponse>("/admin/observability/summary"),
    apiClient.get<ObservabilitySeriesResponse>(
      "/admin/observability/requests-over-time",
    ),
    apiClient.get<ObservabilitySeriesResponse>(
      "/admin/observability/errors-over-time",
    ),
    apiClient.get<ObservabilitySeriesResponse>(
      "/admin/observability/latency-over-time",
    ),
    apiClient.get<ObservabilityRoutesResponse>("/admin/observability/routes"),
    apiClient.get<ObservabilityHealthResponse>("/admin/observability/health"),
  ]);

  return {
    summary: summary.data,
    requests: requests.data,
    errors: errors.data,
    latency: latency.data,
    routes: routes.data,
    health: health.data,
  };
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  tone = "primary",
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  tone?: "primary" | "danger" | "success" | "warning" | "info";
}) {
  const toneClassMap = {
    primary: "bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]",
    danger: "bg-[var(--admin-error-soft)] text-[var(--admin-error)]",
    success: "bg-[var(--admin-success-soft)] text-[var(--admin-success)]",
    warning: "bg-[var(--admin-warning-soft)] text-[var(--admin-warning)]",
    info: "bg-[var(--admin-info-soft)] text-[var(--admin-info)]",
  };

  return (
    <div className="admin-surface rounded-[2rem] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[var(--admin-muted)]">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-[var(--admin-text)]">
            {value}
          </p>
          <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-[var(--admin-placeholder)]">
            {subtitle}
          </p>
        </div>
        <div className={`rounded-2xl p-3 ${toneClassMap[tone]}`}>{icon}</div>
      </div>
    </div>
  );
}

function ChartPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="admin-surface rounded-[2rem] p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-[var(--admin-text)]">{title}</h2>
        <p className="mt-1 text-sm text-[var(--admin-muted)]">{description}</p>
      </div>
      <div className="h-72 w-full">{children}</div>
    </div>
  );
}

function StatusPill({ label, value }: { label: string; value: string }) {
  const normalized = value.toLowerCase();
  const className = normalized === "ok" || normalized === "ready"
    ? "admin-badge-success"
    : normalized === "not_ready" || normalized === "failed"
      ? "admin-badge-danger"
      : "admin-badge-warning";

  return (
    <div className="flex items-center justify-between rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-background)] px-4 py-3">
      <span className="text-sm font-medium text-[var(--admin-muted)]">{label}</span>
      <span className={`${className} rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]`}>
        {value.replace(/_/g, " ")}
      </span>
    </div>
  );
}

export default function ObservabilityScreen({
  initialData,
  initialError,
}: {
  initialData: ObservabilityPayload | null;
  initialError?: string | null;
}) {
  const [data, setData] = useState<ObservabilityPayload | null>(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(initialError || null);

  const refresh = useCallback(async (background = false) => {
    if (background) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const nextData = await fetchObservabilityPayload();
      setData(nextData);
      setError(null);
    } catch (refreshError) {
      const message =
        refreshError instanceof Error
          ? refreshError.message
          : "Failed to load observability data.";
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!initialData) {
      void refresh(false);
    }
  }, [initialData, refresh]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void refresh(true);
    }, 300_000);

    return () => window.clearInterval(interval);
  }, [refresh]);

  const requestChartData = useMemo(
    () =>
      (data?.requests.points || []).map((point) => ({
        ...point,
        label: formatTimestampLabel(point.timestamp),
      })),
    [data?.requests.points],
  );

  const errorChartData = useMemo(
    () =>
      (data?.errors.points || []).map((point) => ({
        ...point,
        label: formatTimestampLabel(point.timestamp),
      })),
    [data?.errors.points],
  );

  const latencyChartData = useMemo(
    () =>
      (data?.latency.points || []).map((point) => ({
        ...point,
        label: formatTimestampLabel(point.timestamp),
      })),
    [data?.latency.points],
  );

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-[2rem] border border-[var(--admin-border)] bg-[var(--admin-card)]"
            />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-96 animate-pulse rounded-[2rem] border border-[var(--admin-border)] bg-[var(--admin-card)]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="admin-surface flex min-h-[360px] flex-col items-center justify-center rounded-[2rem] p-8 text-center">
        <ServerCrash className="h-10 w-10 text-[var(--admin-error)]" />
        <h1 className="mt-4 text-2xl font-semibold text-[var(--admin-text)]">
          Observability is unavailable
        </h1>
        <p className="mt-2 max-w-xl text-sm text-[var(--admin-muted)]">
          {error || "We could not load the current operational metrics."}
        </p>
        <button
          type="button"
          onClick={() => void refresh(false)}
          className="admin-button-primary mt-6 rounded-full px-5 py-3 text-sm font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--admin-text)]">
            Observability
          </h1>
          <p className="mt-1 text-sm text-[var(--admin-muted)]">
            Internal operational visibility for the last{" "}
            {data.summary.windowMinutes} minutes. Metrics are process-local and reset on backend restart.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-[var(--admin-primary-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--admin-primary)]">
            Updated {new Date(data.summary.lastUpdated).toLocaleTimeString()}
          </span>
          <button
            type="button"
            onClick={() => void refresh(true)}
            className="admin-button-secondary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-[1.5rem] border border-[var(--admin-warning)] bg-[var(--admin-warning-soft)] px-4 py-3 text-sm text-[var(--admin-text)]">
          Showing the latest available data. Background refresh failed: {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          title="Total requests"
          value={formatCompactNumber(data.summary.totalRequests)}
          subtitle={`Window: ${data.summary.windowMinutes} min`}
          icon={<Activity className="h-5 w-5" />}
          tone="primary"
        />
        <SummaryCard
          title="5xx errors"
          value={formatCompactNumber(data.summary.total5xxErrors)}
          subtitle="Server-side failures"
          icon={<ServerCrash className="h-5 w-5" />}
          tone="danger"
        />
        <SummaryCard
          title="Average latency"
          value={formatLatency(data.summary.averageLatencyMs)}
          subtitle="Across all tracked routes"
          icon={<Clock3 className="h-5 w-5" />}
          tone="info"
        />
        <SummaryCard
          title="p95 latency"
          value={formatLatency(data.summary.p95LatencyMs)}
          subtitle="Approximate from buckets"
          icon={<TimerReset className="h-5 w-5" />}
          tone="warning"
        />
        <SummaryCard
          title="Health"
          value={`${data.summary.health.live} / ${data.summary.health.ready}`}
          subtitle="Liveness / readiness"
          icon={<HeartPulse className="h-5 w-5" />}
          tone={data.summary.health.ready === "ready" ? "success" : "danger"}
        />
        <SummaryCard
          title="Last updated"
          value={new Date(data.summary.lastUpdated).toLocaleTimeString()}
          subtitle="Dashboard payload timestamp"
          icon={<RefreshCw className="h-5 w-5" />}
          tone="success"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartPanel
          title="Requests over time"
          description="Per-minute request volume from the rolling snapshot window."
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={requestChartData} margin={{ top: 10, right: 16, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border)" opacity={0.4} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--chart-text)", fontSize: 11 }} minTickGap={24} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--chart-text)", fontSize: 11 }} />
              <Tooltip
                labelFormatter={(_, payload) => buildChartTooltipLabel(payload?.[0]?.payload?.timestamp)}
                formatter={(value) => [value ?? 0, "Requests"]}
                contentStyle={{
                  backgroundColor: "var(--card-bg)",
                  borderRadius: "1rem",
                  border: "1px solid var(--border)",
                }}
              />
              <Line type="monotone" dataKey="value" stroke="var(--admin-primary)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel
          title="Errors over time"
          description="Per-minute count of 5xx responses."
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={errorChartData} margin={{ top: 10, right: 16, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border)" opacity={0.4} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--chart-text)", fontSize: 11 }} minTickGap={24} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--chart-text)", fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                labelFormatter={(_, payload) => buildChartTooltipLabel(payload?.[0]?.payload?.timestamp)}
                formatter={(value) => [value ?? 0, "5xx errors"]}
                contentStyle={{
                  backgroundColor: "var(--card-bg)",
                  borderRadius: "1rem",
                  border: "1px solid var(--border)",
                }}
              />
              <Line type="monotone" dataKey="value" stroke="var(--admin-error)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>

      <ChartPanel
        title="Latency over time"
        description="Average latency and approximate p95 latency by minute."
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={latencyChartData} margin={{ top: 10, right: 16, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border)" opacity={0.4} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--chart-text)", fontSize: 11 }} minTickGap={24} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--chart-text)", fontSize: 11 }} />
            <Tooltip
              labelFormatter={(_, payload) => buildChartTooltipLabel(payload?.[0]?.payload?.timestamp)}
              formatter={(value, name) => [
                formatLatency(typeof value === "number" ? value : Number(value)),
                name === "avgLatencyMs" ? "Average latency" : "p95 latency",
              ]}
              contentStyle={{
                backgroundColor: "var(--card-bg)",
                borderRadius: "1rem",
                border: "1px solid var(--border)",
              }}
            />
            <Line type="monotone" dataKey="avgLatencyMs" name="avgLatencyMs" stroke="var(--admin-info)" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="p95LatencyMs" name="p95LatencyMs" stroke="var(--admin-warning)" strokeWidth={2.5} dot={false} strokeDasharray="6 4" />
          </LineChart>
        </ResponsiveContainer>
      </ChartPanel>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="admin-surface rounded-[2rem] p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[var(--admin-text)]">
                Top routes
              </h2>
              <p className="mt-1 text-sm text-[var(--admin-muted)]">
                Highest-volume routes across the rolling snapshot window.
              </p>
            </div>
            <div className="rounded-full bg-[var(--admin-primary-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--admin-primary)]">
              {data.routes.routes.length} routes
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.18em] text-[var(--admin-muted)]">
                  <th className="px-3 py-2 font-semibold">Route</th>
                  <th className="px-3 py-2 font-semibold">Method</th>
                  <th className="px-3 py-2 font-semibold">Requests</th>
                  <th className="px-3 py-2 font-semibold">5xx</th>
                  <th className="px-3 py-2 font-semibold">Avg</th>
                  <th className="px-3 py-2 font-semibold">P95</th>
                </tr>
              </thead>
              <tbody>
                {data.routes.routes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-background)] px-4 py-8 text-center text-sm text-[var(--admin-muted)]"
                    >
                      No route activity has been captured yet.
                    </td>
                  </tr>
                ) : (
                  data.routes.routes.map((route) => (
                    <tr
                      key={`${route.method}-${route.route}`}
                      className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-background)] text-sm text-[var(--admin-text)]"
                    >
                      <td className="rounded-l-2xl px-3 py-3 font-medium">
                        <div className="flex items-center gap-2">
                          <RouteIcon className="h-4 w-4 text-[var(--admin-muted)]" />
                          <span className="truncate">{route.route}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="rounded-full bg-[var(--admin-primary-soft)] px-2 py-1 text-xs font-semibold text-[var(--admin-primary)]">
                          {route.method}
                        </span>
                      </td>
                      <td className="px-3 py-3">{route.requestCount.toLocaleString()}</td>
                      <td className="px-3 py-3">
                        <span className={route.errorCount > 0 ? "text-[var(--admin-error)]" : "text-[var(--admin-muted)]"}>
                          {route.errorCount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-3 py-3">{formatLatency(route.avgLatencyMs)}</td>
                      <td className="rounded-r-2xl px-3 py-3">{formatLatency(route.p95LatencyMs)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs text-[var(--admin-muted)]">
            {data.routes.limitation}
          </p>
        </div>

        <div className="admin-surface rounded-[2rem] p-5">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-[var(--admin-text)]">Health</h2>
            <p className="mt-1 text-sm text-[var(--admin-muted)]">
              Current application and dependency readiness.
            </p>
          </div>

          <div className="space-y-3">
            <StatusPill label="App live" value={data.health.liveness.status} />
            <StatusPill label="App ready" value={data.health.readiness.status} />
            <StatusPill
              label="Mongo"
              value={data.health.readiness.checks?.mongo || "unknown"}
            />
            <StatusPill
              label="Redis"
              value={data.health.readiness.checks?.redis || "unknown"}
            />
          </div>

          {(data.health.readiness.errors?.mongo || data.health.readiness.errors?.redis) && (
            <div className="mt-5 rounded-[1.5rem] border border-[var(--admin-warning)] bg-[var(--admin-warning-soft)] p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--admin-text)]">
                <AlertTriangle className="h-4 w-4 text-[var(--admin-warning)]" />
                Dependency notes
              </div>
              <div className="space-y-2 text-sm text-[var(--admin-muted)]">
                {data.health.readiness.errors?.mongo && (
                  <p>Mongo: {data.health.readiness.errors.mongo}</p>
                )}
                {data.health.readiness.errors?.redis && (
                  <p>Redis: {data.health.readiness.errors.redis}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
