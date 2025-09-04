import { Module } from '@nestjs/common';
import { AuthController } from './auth.service';
import { SmsService } from './sms.service';

@Module({
  controllers: [AuthController],
  providers: [SmsService],
  exports: [SmsService],
})
export class ServiceModule {}
