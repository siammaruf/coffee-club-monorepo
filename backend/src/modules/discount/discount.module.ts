import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscountController } from './discount.controller';
import { DiscountService } from './providers/discount.service';
import { Discount } from './entities/discount.entity';
import { CacheModule } from '../cache/cache.module';

@Module({
    imports: [TypeOrmModule.forFeature([Discount]), CacheModule],
    controllers: [DiscountController],
    providers: [DiscountService],
    exports: [DiscountService],
})
export class DiscountModule {}