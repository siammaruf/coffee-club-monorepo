import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Discount } from '../discount/entities/discount.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Item } from '../items/entities/item.entity';
import { Category } from '../categories/entities/category.entity';
import { DiscountApplicationService } from './provider/discount-application.service';
import { DiscountApplicationController } from './discount-application.controller';
import { DiscountApplication } from './entities/discount-application.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DiscountApplication,
      Discount,
      Customer,
      Item,
      Category,
    ]),
  ],
  controllers: [DiscountApplicationController],
  providers: [DiscountApplicationService],
  exports: [DiscountApplicationService],
})
export class DiscountApplicationModule {}
