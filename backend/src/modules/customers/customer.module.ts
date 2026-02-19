import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerController } from './customer.controller';
import { CustomerService } from './providers/customer.service';
import { Customer } from './entities/customer.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { Order } from '../orders/entities/order.entity';
import { CacheModule } from '../cache/cache.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Customer, Order]),
        CloudinaryModule,
        CacheModule,
        SettingsModule,
    ],
    controllers: [CustomerController],
    providers: [CustomerService],
    exports: [CustomerService],
})
export class CustomerModule {}