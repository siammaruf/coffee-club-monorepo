import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItem } from './entities/order-item.entity';
import { OrderItemService } from './providers/order-item.service';
import { OrderItemController } from './order-item.controller';
import { ItemModule } from '../items/item.module';
import { Item } from '../items/entities/item.entity';
import { ItemVariation } from '../items/entities/item-variation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderItem, Item, ItemVariation]),
    ItemModule
  ],
  controllers: [OrderItemController],
  providers: [OrderItemService],
  exports: [OrderItemService],
})
export class OrderItemModule {}