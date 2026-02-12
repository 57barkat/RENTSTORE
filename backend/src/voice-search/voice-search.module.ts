import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { VoiceSearchController } from "./voice-search.controller";
import { VoiceSearchService } from "./voice-search.service";
import { VoiceSessionService } from "./voice-session.service";
import { VoiceSession, VoiceSessionSchema } from "./voice-session.schema";

import { PropertyModule } from "../modules/property/property.module";

@Module({
  imports: [
    PropertyModule,
    MongooseModule.forFeature([
      { name: VoiceSession.name, schema: VoiceSessionSchema },
    ]),
  ],
  controllers: [VoiceSearchController],
  providers: [VoiceSearchService, VoiceSessionService],
  exports: [VoiceSessionService],
})
export class VoiceSearchModule {}
