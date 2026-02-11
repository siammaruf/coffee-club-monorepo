import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KitchenOrder } from './entities/kitchen-order.entity';
import { KitchenOrderItem } from './entities/kitchen-order-item.entity';
import { KitchenStock } from '../kitchen-stock/entities/kitchen-stock.entity';
import { KitchenOrderService } from './providers/kitchen-order.service';
import { KitchenOrderController } from './kitchen-order.controller';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([KitchenOrder, KitchenOrderItem, KitchenStock]),
    CacheModule,
  ],
  controllers: [KitchenOrderController],
  providers: [KitchenOrderService],
  exports: [KitchenOrderService],
})
export class KitchenOrderModule {}