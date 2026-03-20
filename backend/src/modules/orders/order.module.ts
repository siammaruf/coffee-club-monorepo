import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Table } from '../table/entities/table.entity';
import { OrderController } from './order.controller';
import { OrderService } from './providers/order.service';
import { OrderItemModule } from '../order-items/order-item.module';
import { OrderTokensModule } from '../order-tokens/order-tokens.module';
import { Discount } from '../discount/entities/discount.entity';
import { CustomerModule } from '../customers/customer.module';
import { CacheModule } from '../cache/cache.module';
import { SmsModule } from '../sms/sms.module';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Table, Discount]),
    OrderItemModule,
    OrderTokensModule,
    CustomerModule,
    CacheModule,
    SmsModule,
    WhatsAppModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}