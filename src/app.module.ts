import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validateEnvironment } from './config/env.validation';
import { FoundPetsModule } from './found-pets/found-pets.module';
import { LostPetsModule } from './lost-pets/lost-pets.module';
import { MailModule } from './mail/mail.module';
import { buildTypeOrmOptions } from './database/typeorm.config';
import { RedisCacheModule } from './cache/redis-cache.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: validateEnvironment,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: buildTypeOrmOptions,
    }),
    RedisCacheModule,
    MailModule,
    LostPetsModule,
    FoundPetsModule,
    HealthModule,
  ],
})
export class AppModule {}
