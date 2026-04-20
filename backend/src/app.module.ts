import { APP_GUARD } from "@nestjs/core";
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import appConfig from "./config/app.config";
import dbConfig from "./config/database.config";
import { validationSchema } from "./config/validation";

import { UserModule } from "./modules/user/user.module";
import { ServiceModule } from "./modules/sms/sms.module";
import { ScheduleModule } from "@nestjs/schedule";
import { PropertyModule } from "./modules/property/property.module";
import { CloudinaryModule } from "./services/Cloudinary Service/cloudinary.module";
import { AuthModule } from "./services/auth.module";
import { AddToFavModule } from "./modules/addToFav/favorite.module";
import { ProfileModule } from "./profile/profile.module";
import { VoiceSearchModule } from "./voice-search/voice-search.module";
import { ChatModule } from "./chat/chat.module";
import { AdminModule } from "./modules/admin/admin.module";
import { ReportsModule } from "./modules/report/reports.module";
import { EmailModule } from "./services/email/email.module";
import { AgencyModule } from "./modules/Agency/agency.module";
import { PaymentModule } from "./services/payment/payment.module";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";
import { RolesGuard } from "./auth/guards/roles.guard";
import { RequestRateLimitGuard } from "./rate-limit/request-rate-limit.guard";
import { RequestRateLimitModule } from "./rate-limit/request-rate-limit.module";
import { RequestLoggingMiddleware } from "./common/middleware/request-logging.middleware";

@Module({
  imports: [
    ScheduleModule.forRoot(),

    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, dbConfig],
      validationSchema,
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const db = config.get<Record<string, any>>("database", { infer: true });
        if (!db) throw new Error("Database config is missing");

        return {
          uri: db.uri,
          dbName: db.dbName,
          maxPoolSize: db.maxPoolSize,
          minPoolSize: db.minPoolSize,
          serverSelectionTimeoutMS: db.serverSelectionTimeoutMS,
          socketTimeoutMS: db.socketTimeoutMS,
          autoIndex: db.autoIndex,
        };
      },
    }),

    UserModule,
    ServiceModule,
    PropertyModule,
    CloudinaryModule,
    AuthModule,
    AddToFavModule,
    ProfileModule,
    VoiceSearchModule,
    ChatModule,
    AdminModule,
    ReportsModule,
    EmailModule,
    AgencyModule,
    PaymentModule,
    RequestRateLimitModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RequestRateLimitGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggingMiddleware).forRoutes("*");
  }
}
