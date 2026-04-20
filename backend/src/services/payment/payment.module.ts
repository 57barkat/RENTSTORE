import { Global, Module } from "@nestjs/common";
import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Payment, PaymentSchema } from "./payment.schema";
import { PaymentSocketGateway } from "./payment-socket.gateway";
import { UserModule } from "../../modules/user/user.module";
import { AuthModule } from "../auth.module";
@Global()
@Module({
  imports: [
    AuthModule,
    UserModule,
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentSocketGateway],
  exports: [PaymentService, PaymentSocketGateway],
})
export class PaymentModule {}
