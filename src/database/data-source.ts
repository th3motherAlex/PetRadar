import 'dotenv/config';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { buildDataSourceOptions } from './typeorm.config';

const configService = new ConfigService(process.env);

export default new DataSource(buildDataSourceOptions(configService));
