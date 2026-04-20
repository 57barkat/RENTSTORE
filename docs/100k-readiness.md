# 100k Readiness Notes

This repo now removes the shared frontend secret model, secures mobile tokens with `expo-secure-store` where available, and requires JWT-authenticated payment socket connections. The remaining rollout work is operational and should be treated as release blockers for a large-scale launch.

## Load testing

Use `backend/load-test.js` with concurrency that reflects expected active users, not total registrations.

Example:

```powershell
cd backend
k6 run load-test.js `
  -e BASE_URL=https://api.example.com/api/v1 `
  -e TEST_EMAIL_OR_PHONE=loadtest@example.com `
  -e TEST_PASSWORD=strong-password `
  -e LOAD_PROFILE=rollout `
  -e BROWSING_TARGET=800 `
  -e AUTH_TARGET=250 `
  -e HOLD_DURATION=15m `
  -e P95_THRESHOLD=700 `
  -e P99_THRESHOLD=1200
```

Recommended rollout gates:

- Public browse/search traffic should pass at the expected peak concurrent-user level plus headroom.
- Authenticated search/property detail traffic should pass at the expected signed-in concurrency level.
- Run tests against production-like infra, not a laptop or single local container.
- Capture CPU, memory, DB latency, error rate, and socket connection counts during the run.

## Realtime scaling

- Do not scale Socket.IO horizontally without a shared adapter strategy.
- Choose one of:
  - Sticky sessions at the load balancer for single-node socket affinity.
  - A Redis adapter for Socket.IO if you want true multi-instance fanout.
- Payment and chat events should be verified in a multi-replica environment before rollout.

## Observability baseline

The backend now emits per-request JSON log lines with `requestId`, method, path, status, and duration. Before a broad rollout, also add:

- Central log collection with retention and search.
- Crash reporting for the Expo app and backend.
- Metrics dashboards for latency, 4xx/5xx rate, DB health, and websocket connection counts.
- Alerts for error-rate spikes, high latency, and failed background jobs/webhooks.
- Distributed tracing or at least correlation via `x-request-id`.

## Infra sizing and delivery

- Define replica counts for API workers and socket workers separately if needed.
- Size MongoDB for connection pools, read/write throughput, and index growth.
- Put image/media delivery behind a CDN.
- Validate Cloudinary and payment-provider rate limits for your peak traffic model.
- Document deploy rollback steps and health-check criteria before launch.
