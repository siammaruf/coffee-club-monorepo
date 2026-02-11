import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderTokensService } from './provider/order-tokens.service';
import { OrderTokensController } from './order-tokens.controller';
import { OrderToken } from './entities/order-token.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../order-items/entities/order-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderToken, Order, OrderItem])
  ],
  controllers: [OrderTokensController],
  providers: [OrderTokensService],
  exports: [OrderTokensService]
})
export class OrderTokensModule {}