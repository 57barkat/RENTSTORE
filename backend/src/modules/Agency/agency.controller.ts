import { Controller, Post, Body, Param } from "@nestjs/common";
import { AgencyService } from "./agency.service";

@Controller("agency")
export class AgencyController {
  constructor(private readonly agencyService: AgencyService) {}

  @Post("create/:userId")
  createAgency(@Param("userId") userId: string, @Body("name") name: string) {
    return this.agencyService.createAgency(userId, name);
  }

  @Post("add-agent/:agencyId/:agentId")
  addAgent(
    @Param("agencyId") agencyId: string,
    @Param("agentId") agentId: string,
  ) {
    return this.agencyService.addAgent(agencyId, agentId);
  }
}
