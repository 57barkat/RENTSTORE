import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { finalize } from "rxjs/operators";
import { MetricsService } from "./metrics.service";

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== "http") {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startedAt = process.hrtime.bigint();

    return next.handle().pipe(
      finalize(() => {
        const durationSeconds =
          Number(process.hrtime.bigint() - startedAt) / 1_000_000_000;
        const labels = {
          method: this.normalizeMethod(request?.method),
          route: this.normalizeRoute(request),
          status: String(response?.statusCode ?? 500),
        };

        this.metricsService.recordHttpRequest(labels, durationSeconds);
      }),
    );
  }

  private normalizeMethod(method?: string) {
    return method?.toUpperCase() || "UNKNOWN";
  }

  private normalizeRoute(request: any) {
    const routePath = request?.route?.path;
    const baseUrl = request?.baseUrl || "";

    if (typeof routePath === "string" && routePath.length > 0) {
      return this.joinPaths(baseUrl, routePath);
    }

    const originalUrl = request?.originalUrl || request?.url;
    if (typeof originalUrl === "string" && originalUrl.length > 0) {
      const pathWithoutQuery = originalUrl.split("?")[0];
      return pathWithoutQuery || "unknown";
    }

    return "unknown";
  }

  private joinPaths(baseUrl: string, routePath: string) {
    const combined = `${baseUrl}/${routePath}`.replace(/\/+/g, "/");
    const normalized = combined !== "/" ? combined.replace(/\/$/, "") : combined;

    return normalized.startsWith("/") ? normalized : `/${normalized}`;
  }
}
