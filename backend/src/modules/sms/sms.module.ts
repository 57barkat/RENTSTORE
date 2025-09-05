import { Module } from '@nestjs/common';
import { AuthController } from './sms.controller';
import { SmsService } from './sms.service';

@Module({
  controllers: [AuthController],
  providers: [SmsService],
  exports: [SmsService],
})
export class ServiceModule {}
