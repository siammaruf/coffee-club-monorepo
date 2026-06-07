import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const databaseConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: parseInt(configService.get('DB_PORT') ?? '5432', 10),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_NAME'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    synchronize: configService.get<boolean>('DB_SYNC', false),
    logging: configService.get<boolean>('DB_LOGGING', false),
    maxQueryExecutionTime: configService.get<number>('DB_SLOW_QUERY_MS', 1000),
    entityPrefix: configService.get<string>('DB_TABLE_PREFIX', ''),
    extra: {
      max: configService.get<number>('DB_POOL_MAX', 20),
      min: configService.get<number>('DB_POOL_MIN', 5),
      acquireTimeoutMillis: configService.get<number>('DB_POOL_ACQUIRE_TIMEOUT', 60000),
      idleTimeoutMillis: configService.get<number>('DB_POOL_IDLE_TIMEOUT', 30000),
      connectionTimeoutMillis: configService.get<number>('DB_POOL_CONNECTION_TIMEOUT', 5000),
    },
  }),
  inject: [ConfigService],
};
