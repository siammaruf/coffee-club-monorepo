import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { featureModules } from './config/modules.config';
import { EncryptionUtil } from './common/utils/encryption.util';
import { CacheModule } from './modules/cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync(databaseConfig),
    ...featureModules,
    CacheModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(configService: ConfigService) {
    EncryptionUtil.setConfigService(configService);
  }
}
