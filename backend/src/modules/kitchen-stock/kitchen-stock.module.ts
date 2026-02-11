import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KitchenStock } from './entities/kitchen-stock.entity';
import { KitchenItems } from '../kitchen-items/entities/kitchen-item.entity';
import { KitchenStockService } from './providers/kitchen-stock.service';
import { KitchenStockController } from './kitchen-stock.controller';

@Module({
  imports: [TypeOrmModule.forFeature([KitchenStock, KitchenItems])], 
  controllers: [KitchenStockController],
  providers: [KitchenStockService],
  exports: [KitchenStockService],
})
export class KitchenStockModule {}