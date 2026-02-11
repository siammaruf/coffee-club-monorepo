import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Cacheable } from 'cacheable';
import { createKeyv } from '@keyv/redis';
import { CacheService } from './cache.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'CACHE_INSTANCE',
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST', '');
        const port = configService.get<string>('REDIS_PORT', '');
        const user = configService.get<string>('REDIS_USER', '');
        const password = configService.get<string>('REDIS_PASSWORD') ? `:${encodeURIComponent(configService.get<string>('REDIS_PASSWORD') || '')}` : '';
        const db = configService.get<string>('REDIS_DB') ? `/${configService.get<string>('REDIS_DB')}` : '';

        let authPart = '';
        if (user && password) {
          authPart = `${user}${password}@`;
        } else if (password) {
          authPart = `:${password}@`;
        }

        const redisUri = `redis://${authPart}${host}:${port}${db}`;
        const prefix = configService.get<string>('REDIS_PREFIX', '');
        const secondary = createKeyv(redisUri, { 
          namespace: prefix,
          keyPrefixSeparator:':' 
        });
        return new Cacheable({ secondary, ttl: '4h' });
      },
      inject: [ConfigService],
    },
    CacheService,
  ],
  exports: ['CACHE_INSTANCE', CacheService],
})
export class CacheModule {}