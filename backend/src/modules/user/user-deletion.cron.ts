import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { UserService } from "./user.service";

@Injectable()
export class UserDeletionCron {
  private readonly logger = new Logger(UserDeletionCron.name);

  constructor(private readonly userService: UserService) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleCron() {
    const result = await this.userService.purgeExpiredSelfDeletedAccounts();

    if (result.deletedUsers > 0 || result.deletedProperties > 0) {
      this.logger.log(
        `Purged ${result.deletedUsers} expired self-deleted accounts and ${result.deletedProperties} properties.`,
      );
    }
  }
}
