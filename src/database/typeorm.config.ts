import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { FoundPet } from '../found-pets/entities/found-pet.entity';
import { LostPet } from '../lost-pets/entities/lost-pet.entity';
import { CreatePetRadarSchema1710600000000 } from './migrations/1710600000000-CreatePetRadarSchema';

export function buildDataSourceOptions(configService: ConfigService): DataSourceOptions {
  return {
    type: 'postgres',
    host: configService.getOrThrow<string>('DB_HOST'),
    port: Number(configService.getOrThrow<string>('DB_PORT')),
    username: configService.getOrThrow<string>('DB_USERNAME'),
    password: configService.getOrThrow<string>('DB_PASSWORD'),
    database: configService.getOrThrow<string>('DB_NAME'),
    entities: [LostPet, FoundPet],
    migrations: [CreatePetRadarSchema1710600000000],
    synchronize: false,
    logging: false,
  };
}

export function buildTypeOrmOptions(configService: ConfigService): TypeOrmModuleOptions {
  return buildDataSourceOptions(configService);
}
