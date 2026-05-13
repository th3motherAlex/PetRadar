import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisCacheService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheService.name);
  private readonly client: Redis;

  constructor(private readonly configService: ConfigService) {
    this.client = new Redis({
      host: this.configService.getOrThrow<string>('REDIS_HOST'),
      port: Number(this.configService.getOrThrow<string>('REDIS_PORT')),
      maxRetriesPerRequest: 1,
      lazyConnect: true,
    });

    this.client.on('error', (error) => {
      this.logger.warn(`Redis cache unavailable: ${error.message}`);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      await this.connectIfNeeded();
      const value = await this.client.get(key);

      return value ? (JSON.parse(value) as T) : null;
    } catch (error) {
      this.logger.warn(`Unable to read Redis cache key ${key}`);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds = 60): Promise<void> {
    try {
      await this.connectIfNeeded();
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (error) {
      this.logger.warn(`Unable to write Redis cache key ${key}`);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.connectIfNeeded();
      await this.client.del(key);
    } catch (error) {
      this.logger.warn(`Unable to delete Redis cache key ${key}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      if (this.client.status !== 'end') {
        await this.client.quit();
      }
    } catch (error) {
      this.logger.warn('Unable to close Redis connection cleanly');
    }
  }

  private async connectIfNeeded(): Promise<void> {
    if (this.client.status === 'wait') {
      await this.client.connect();
    }
  }
}
