import {
  Controller,
  Post,
  Body,
  Param,
  Req,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { AgencyService } from "./agency.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
@Controller("agency")
export class AgencyController {
  constructor(private readonly agencyService: AgencyService) {}

  @Post("create/:userId")
  createAgency(
    @Param("userId") userId: string,
    @Body("name") name: string,
    @Req() req: any,
  ) {
    const actorId = req.user?.userId;
    const isAdmin = req.user?.role === "admin";

    if (!actorId || (actorId !== userId && !isAdmin)) {
      throw new UnauthorizedException("Not allowed to create this agency");
    }

    return this.agencyService.createAgency(userId, name);
  }

  @Post("add-agent/:agencyId/:agentId")
  addAgent(
    @Param("agencyId") agencyId: string,
    @Param("agentId") agentId: string,
    @Req() req: any,
  ) {
    return this.agencyService.addAgent(
      agencyId,
      agentId,
      req.user?.userId,
      req.user?.role,
    );
  }
}
