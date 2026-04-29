import { Controller, Get, Query } from "@nestjs/common";

import { Public } from "../../common/decorators/public.decorator";
import { RateLimit } from "../../common/decorators/rate-limit.decorator";
import { PropertyService } from "./property.service";

@Controller("seo")
export class SeoController {
  constructor(private readonly propertyService: PropertyService) {}

  @Get("popular-locations")
  @Public()
  @RateLimit({ limit: 120, windowMs: 60_000, scope: "userOrIp" })
  async getPopularLocations(
    @Query("city") city?: string,
    @Query("type") type?: string,
    @Query("propertyType") propertyType?: string,
    @Query("purpose") purpose?: "rent" | "sale",
    @Query("limit") limit?: string,
  ) {
    return this.propertyService.getPopularLocations({
      city,
      propertyType: propertyType || type,
      purpose,
      limit: limit ? Number(limit) : undefined,
    });
  }
}
