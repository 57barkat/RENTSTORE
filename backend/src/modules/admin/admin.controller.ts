import { Controller, Get, Query, SetMetadata, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AdminService } from "./admin.service";

@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(AuthGuard("jwt"))
  @Get("stats")
  @SetMetadata("roles", ["admin"])
  async getStats(@Query("range") range?: string) {
    return await this.adminService.getDashboardStats(range);
  }
}
