import { Module } from "@nestjs/common";
import { HealthModule } from "../health/health.module";
import { MetricsModule } from "../metrics/metrics.module";
import { ObservabilityController } from "./observability.controller";
import { ObservabilityService } from "./observability.service";

@Module({
  imports: [MetricsModule, HealthModule],
  controllers: [ObservabilityController],
  providers: [ObservabilityService],
})
export class ObservabilityModule {}
