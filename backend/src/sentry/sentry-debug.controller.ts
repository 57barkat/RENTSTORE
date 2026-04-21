import { Controller, Get } from "@nestjs/common";
import { Public } from "../common/decorators/public.decorator";

@Controller()
export class SentryDebugController {
  @Public()
  @Get("debug-sentry")
  debugSentry() {
    throw new Error("Sentry test error from /debug-sentry");
  }
}
