import { Controller, Get, SetMetadata, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AdminService } from "./admin.service";

@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(AuthGuard("jwt"))
  @Get("stats")
  @SetMetadata("roles", ["admin"])
  async getStats() {
    return await this.adminService.getDashboardStats();
  }
}
