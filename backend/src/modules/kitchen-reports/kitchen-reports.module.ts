import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KitchenReportsController } from './kitchen-reports.controller';
import { KitchenReportsService } from './providers/kitchen-reports.service';
import { OrderToken } from '../order-tokens/entities/order-token.entity';
import { CacheModule } from '../cache/cache.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([OrderToken]),
        CacheModule,
    ],
    controllers: [KitchenReportsController],
    providers: [KitchenReportsService],
    exports: [KitchenReportsService],
})
export class KitchenReportsModule {}
