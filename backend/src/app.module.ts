import { ConfigService } from "@nestjs/config";
import { Module, MiddlewareConsumer } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { MailerModule } from "@nestjs-modules/mailer"; // Added
import appConfig from "./config/app.config";
import dbConfig from "./config/database.config";
import { validationSchema } from "./config/validation";
import { UserModule } from "./modules/user/user.module";
import { ServiceModule } from "./modules/sms/sms.module";
import { SignupThrottleMiddleware } from "./middleware/signup-throttle.middleware";
import { ScheduleModule } from "@nestjs/schedule";
import { PropertyModule } from "./modules/property/property.module";
import { CloudinaryModule } from "./services/Cloudinary Service/cloudinary.module";
import { AuthModule } from "./services/auth.module";
import { AddToFavModule } from "./modules/addToFav/favorite.module";
import { ProfileModule } from "./profile/profile.module";
import { VoiceSearchModule } from "./voice-search/voice-search.module";
import { ChatModule } from "./chat/chat.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, dbConfig],
      validationSchema,
    }),

    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get<string>("MAIL_HOST") || "smtp.gmail.com",
          port: config.get<number>("MAIL_PORT") || 465,
          secure: true,
          auth: {
            user: config.get<string>("MAIL_USER"),
            pass: config.get<string>("MAIL_PASS"),
          },
        },
        defaults: {
          from: config.get<string>("MAIL_FROM"),
        },
      }),
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const db = config.get<{ uri: string; dbName: string }>("database", {
          infer: true,
        });
        if (!db) {
          throw new Error("Database config is missing");
        }
        return {
          uri: db.uri,
          dbName: db.dbName,
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
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SignupThrottleMiddleware).forRoutes("users/signup");
  }
}
