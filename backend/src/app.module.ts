import { ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import appConfig from './config/app.config';
import dbConfig from './config/database.config';
import { validationSchema } from './config/validation';
import { UserModule } from './modules/user/user.module'; 
import { ServiceModule } from './service/service.module';  

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, dbConfig],
      validationSchema,
      
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const db = config.get<{ uri: string; dbName: string }>('database', {
          infer: true,
        });
        if (!db) {
          throw new Error('Database config is missing');
        }
        return {
          uri: db.uri,
          dbName: db.dbName,
        };
      },
    }),

    UserModule, 
    ServiceModule, 
  ],
})
export class AppModule {}
