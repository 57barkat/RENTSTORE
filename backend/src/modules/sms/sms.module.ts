import { Module } from '@nestjs/common';
import { AuthController } from './sms.controller';
import { SmsService } from './sms.service';
import { UserModule } from '../user/user.module';

@Module({
  controllers: [AuthController],
  providers: [SmsService],
  exports: [SmsService],
  imports: [UserModule],
})
export class ServiceModule {}
