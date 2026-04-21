import { Controller, Get, HttpException } from "@nestjs/common";
import { Public } from "../common/decorators/public.decorator";
import { HealthService } from "./health.service";

@Public()
@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get("live")
  getLiveness() {
    return this.healthService.getLiveness();
  }

  @Get("ready")
  async getReadiness() {
    const result = await this.healthService.getReadiness();

    if (result.statusCode !== 200) {
      throw new HttpException(result.body, result.statusCode);
    }

    return result.body;
  }
}
