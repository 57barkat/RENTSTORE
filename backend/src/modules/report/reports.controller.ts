import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  Patch,
  Param,
  SetMetadata,
  Query,
} from "@nestjs/common";
import { ReportsService } from "./reports.service";
import { CreateReportDto } from "./dto/create-report.dto";
import { AuthGuard } from "@nestjs/passport";
import { UpdateReportStatusDto } from "./dto/update-report-status.dto";
import { RateLimit } from "../../common/decorators/rate-limit.decorator";

@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @UseGuards(AuthGuard("jwt"))
  @Post()
  @RateLimit({ limit: 10, windowMs: 15 * 60 * 1000, scope: "user" })
  async createReport(@Req() req, @Body() dto: CreateReportDto) {
    const userId = req.user.userId;

    if (!userId) {
      throw new UnauthorizedException("User ID not found in token");
    }

    return this.reportsService.create(userId, dto);
  }

  @Get()
  @SetMetadata("roles", ["admin"])
  async getAllReports(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "20",
  ) {
    return this.reportsService.getAllReports(Number(page), Number(limit));
  }

  @Patch(":id/status")
  @SetMetadata("roles", ["admin"])
  async updateReportStatus(
    @Param("id") reportId: string,
    @Body() dto: UpdateReportStatusDto,
  ) {
    return this.reportsService.updateReportStatus(reportId, dto.status);
  }

  @Patch("property/:id/approve")
  @SetMetadata("roles", ["admin"])
  async approveProperty(@Param("id") propertyId: string) {
    return this.reportsService.approveProperty(propertyId);
  }

  @Patch("property/:id/delete")
  @SetMetadata("roles", ["admin"])
  async deleteProperty(@Param("id") propertyId: string) {
    return this.reportsService.deleteProperty(propertyId);
  }

  @Patch("user/:id/reactivate")
  @SetMetadata("roles", ["admin"])
  async reactivateUser(@Param("id") userId: string) {
    return this.reportsService.reactivateUser(userId);
  }
}
