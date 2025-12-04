import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { DeletedImagesService } from "./deletedImages.service";

@Injectable()
export class DeletedImagesCron {
  private readonly logger = new Logger(DeletedImagesCron.name);

  constructor(private readonly deletedImagesService: DeletedImagesService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.log("Running Cloudinary cleanup job...");
    await this.deletedImagesService.cleanUpDeletedImages();
  }
}
