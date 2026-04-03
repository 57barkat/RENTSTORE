import { Module } from "@nestjs/common";
import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";
import { UserModule } from "src/modules/user/user.module";
import { MongooseModule } from "@nestjs/mongoose";
import { Payment, PaymentSchema } from "./payment.schema";

@Module({
  imports: [
    UserModule,
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
