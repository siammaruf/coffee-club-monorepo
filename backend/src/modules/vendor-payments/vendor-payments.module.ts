import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorPayment } from './entities/vendor-payment.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { VendorPaymentsService } from './providers/vendor-payments.service';
import { VendorPaymentsController } from './vendor-payments.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [TypeOrmModule.forFeature([VendorPayment, Vendor]), CloudinaryModule],
  controllers: [VendorPaymentsController],
  providers: [VendorPaymentsService],
  exports: [VendorPaymentsService],
})
export class VendorPaymentsModule {}
