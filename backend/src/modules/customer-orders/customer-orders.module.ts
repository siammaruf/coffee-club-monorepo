import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerOrdersController } from './customer-orders.controller';
import { CustomerOrdersService } from './providers/customer-orders.service';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../order-items/entities/order-item.entity';
import { Item } from '../items/entities/item.entity';
import { Table } from '../table/entities/table.entity';
import { Customer } from '../customers/entities/customer.entity';
import { CartModule } from '../cart/cart.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Item, Table, Customer]),
    CartModule,
    EmailModule,
  ],
  controllers: [CustomerOrdersController],
  providers: [CustomerOrdersService],
})
export class CustomerOrdersModule {}
