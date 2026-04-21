import { Controller, Get, SetMetadata } from "@nestjs/common";
import { ObservabilityService } from "./observability.service";

@Controller("admin/observability")
@SetMetadata("roles", ["admin"])
export class ObservabilityController {
  constructor(private readonly observabilityService: ObservabilityService) {}

  @Get("summary")
  getSummary() {
    return this.observabilityService.getSummary();
  }

  @Get("requests-over-time")
  getRequestsOverTime() {
    return this.observabilityService.getRequestsOverTime();
  }

  @Get("errors-over-time")
  getErrorsOverTime() {
    return this.observabilityService.getErrorsOverTime();
  }

  @Get("latency-over-time")
  getLatencyOverTime() {
    return this.observabilityService.getLatencyOverTime();
  }

  @Get("routes")
  getRoutes() {
    return this.observabilityService.getRoutes();
  }

  @Get("health")
  getHealth() {
    return this.observabilityService.getHealth();
  }
}
