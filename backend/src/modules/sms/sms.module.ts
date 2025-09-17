import { Module } from '@nestjs/common';
import { AuthController } from './sms.controller';
import { SmsService } from './sms.service';
<<<<<<< HEAD
import { UserModule } from '../user/user.module';
=======
>>>>>>> 59938e7d585bf5e46fc19a3042f7602d0aa8d9c9

@Module({
  controllers: [AuthController],
  providers: [SmsService],
  exports: [SmsService],
<<<<<<< HEAD
  imports: [UserModule],
=======
>>>>>>> 59938e7d585bf5e46fc19a3042f7602d0aa8d9c9
})
export class ServiceModule {}
