import ObservabilityScreen, {
  type ObservabilityHealthResponse,
  type ObservabilityRoutesResponse,
  type ObservabilitySeriesResponse,
  type ObservabilitySummaryResponse,
} from "@/app/components/admin/ObservabilityScreen";
import { requireAdminSession } from "@/app/lib/admin-auth";
import { serverApiRequest } from "@/app/lib/server-api";

export const revalidate = 300;

export default async function ObservabilityPage() {
  const session = await requireAdminSession();

  let initialData: {
    summary: ObservabilitySummaryResponse;
    requests: ObservabilitySeriesResponse;
    errors: ObservabilitySeriesResponse;
    latency: ObservabilitySeriesResponse;
    routes: ObservabilityRoutesResponse;
    health: ObservabilityHealthResponse;
  } | null = null;

  let initialError: string | null = null;

  try {
    const [summary, requests, errors, latency, routes, health] =
      await Promise.all([
        serverApiRequest<ObservabilitySummaryResponse>(
          "/admin/observability/summary",
          { token: session.token },
        ),
        serverApiRequest<ObservabilitySeriesResponse>(
          "/admin/observability/requests-over-time",
          { token: session.token },
        ),
        serverApiRequest<ObservabilitySeriesResponse>(
          "/admin/observability/errors-over-time",
          { token: session.token },
        ),
        serverApiRequest<ObservabilitySeriesResponse>(
          "/admin/observability/latency-over-time",
          { token: session.token },
        ),
        serverApiRequest<ObservabilityRoutesResponse>(
          "/admin/observability/routes",
          { token: session.token },
        ),
        serverApiRequest<ObservabilityHealthResponse>(
          "/admin/observability/health",
          { token: session.token },
        ),
      ]);

    initialData = { summary, requests, errors, latency, routes, health };
  } catch (error) {
    initialError =
      error instanceof Error
        ? error.message
        : "Failed to load observability data.";
  }

  return (
    <ObservabilityScreen
      initialData={initialData}
      initialError={initialError}
    />
  );
}
