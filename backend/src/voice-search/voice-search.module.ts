import { Module } from "@nestjs/common";
import { VoiceSearchController } from "./voice-search.controller";
import { VoiceSearchService } from "./voice-search.service";
import { PropertyModule } from "../modules/property/property.module";

@Module({
  imports: [PropertyModule],
  controllers: [VoiceSearchController],
  providers: [VoiceSearchService],
})
export class VoiceSearchModule {}
