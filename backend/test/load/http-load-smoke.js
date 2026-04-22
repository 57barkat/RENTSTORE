"use strict";

const { performance } = require("node:perf_hooks");

const baseUrl = (
  process.env.LOAD_TEST_BASE_URL || "http://localhost:3000/api/v1"
).replace(/\/$/, "");
const durationSeconds = Number(process.env.LOAD_TEST_DURATION_SECONDS || 10);
const concurrency = Number(process.env.LOAD_TEST_CONCURRENCY || 10);
const mode = (process.env.LOAD_TEST_MODE || "baseline").toLowerCase();

const loginIdentity = process.env.LOAD_TEST_LOGIN || "";
const loginPassword = process.env.LOAD_TEST_PASSWORD || "";
const propertyIdFromEnv = process.env.LOAD_TEST_PROPERTY_ID || "";

function createStats() {
  return {
    total: 0,
    failures: 0,
    rateLimited: 0,
    durations: [],
    errors: [],
    statusCounts: {},
  };
}

function recordResult(stats, result) {
  stats.total += 1;
  stats.durations.push(result.durationMs);
  stats.statusCounts[result.status] = (stats.statusCounts[result.status] || 0) + 1;

  if (result.status === 429) {
    stats.rateLimited += 1;
  } else if (!result.ok) {
    stats.failures += 1;
  }
}

function recordError(stats, error) {
  stats.total += 1;
  stats.failures += 1;
  stats.errors.push(error instanceof Error ? error.message : String(error));
}

async function request(path, init) {
  const startedAt = performance.now();
  const response = await fetch(`${baseUrl}${path}`, init);
  const text = await response.text();

  return {
    ok: response.ok,
    status: response.status,
    durationMs: performance.now() - startedAt,
    text,
  };
}

function percentile(values, ratio) {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil(sorted.length * ratio) - 1),
  );
  return Number(sorted[index].toFixed(2));
}

function average(values) {
  if (values.length === 0) {
    return 0;
  }

  return Number(
    (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2),
  );
}

async function resolvePropertyId() {
  if (propertyIdFromEnv) {
    return propertyIdFromEnv;
  }

  const response = await request(
    "/properties/search?hostOption=hostel&page=1&limit=1&sortBy=newest",
  );

  if (!response.ok) {
    throw new Error(
      `Failed to resolve property id from search: status ${response.status}`,
    );
  }

  const payload = JSON.parse(response.text);
  const propertyId = payload?.data?.[0]?._id;

  if (!propertyId) {
    throw new Error("No property id found for property-detail load mode.");
  }

  return propertyId;
}

async function loginForRefreshToken() {
  if (!loginIdentity || !loginPassword) {
    throw new Error(
      "LOAD_TEST_LOGIN and LOAD_TEST_PASSWORD are required for auth load modes.",
    );
  }

  const response = await request("/users/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      emailOrPhone: loginIdentity,
      password: loginPassword,
    }),
  });

  if (!response.ok) {
    throw new Error(`Login setup failed with status ${response.status}`);
  }

  const payload = JSON.parse(response.text);
  if (!payload?.refreshToken) {
    throw new Error("Login setup did not return refreshToken.");
  }

  return payload.refreshToken;
}

async function buildScenario() {
  if (mode === "baseline") {
    return {
      name: "baseline",
      targets: ["/health/live", "/health/ready", "/metrics"],
      execute: (path) => request(path),
    };
  }

  if (mode === "public_search") {
    return {
      name: "public_search",
      targets: [
        "/properties/search?hostOption=hostel&page=1&limit=12&sortBy=newest",
      ],
      execute: (path) => request(path),
    };
  }

  if (mode === "property_detail") {
    const propertyId = await resolvePropertyId();
    return {
      name: "property_detail",
      targets: [`/properties/${propertyId}`],
      context: { propertyId },
      execute: (path) => request(path),
    };
  }

  if (mode === "auth_login") {
    if (!loginIdentity || !loginPassword) {
      throw new Error(
        "LOAD_TEST_LOGIN and LOAD_TEST_PASSWORD are required for auth_login mode.",
      );
    }

    return {
      name: "auth_login",
      targets: ["/users/login"],
      execute: (path) =>
        request(path, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            emailOrPhone: loginIdentity,
            password: loginPassword,
          }),
        }),
    };
  }

  if (mode === "auth_refresh") {
    const refreshToken = await loginForRefreshToken();
    return {
      name: "auth_refresh",
      targets: ["/users/refresh"],
      context: { refreshTokenPreview: `${refreshToken.slice(0, 12)}...` },
      execute: (path) =>
        request(path, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        }),
    };
  }

  throw new Error(
    `Unknown LOAD_TEST_MODE "${mode}". Supported modes: baseline, public_search, property_detail, auth_login, auth_refresh.`,
  );
}

async function worker(deadline, scenario, stats) {
  let cursor = 0;

  while (Date.now() < deadline) {
    const path = scenario.targets[cursor % scenario.targets.length];
    cursor += 1;

    try {
      const result = await scenario.execute(path);
      recordResult(stats, result);
    } catch (error) {
      recordError(stats, error);
    }
  }
}

async function main() {
  const scenario = await buildScenario();
  const stats = createStats();
  const deadline = Date.now() + durationSeconds * 1000;

  await Promise.all(
    Array.from({ length: concurrency }, () => worker(deadline, scenario, stats)),
  );

  const summary = {
    baseUrl,
    mode: scenario.name,
    targets: scenario.targets,
    ...(scenario.context ? { context: scenario.context } : {}),
    durationSeconds,
    concurrency,
    totalRequests: stats.total,
    failures: stats.failures,
    rateLimited: stats.rateLimited,
    nonRateLimitSuccessRate:
      stats.total === 0
        ? 0
        : Number(
            (
              ((stats.total - stats.failures - stats.rateLimited) / stats.total) *
              100
            ).toFixed(2),
          ),
    avgLatencyMs: average(stats.durations),
    p95LatencyMs: percentile(stats.durations, 0.95),
    statusCounts: stats.statusCounts,
  };

  console.log(JSON.stringify(summary, null, 2));

  if (stats.errors.length > 0) {
    console.error("Load smoke errors:", stats.errors.slice(0, 10));
  }

  if (summary.failures > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
