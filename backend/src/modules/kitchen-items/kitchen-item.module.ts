import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KitchenItems } from './entities/kitchen-item.entity';
import { KitchenItemService } from './providers/kitchen-item.service';
import { KitchenItemController } from './kitchen-item.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([KitchenItems]),
    CloudinaryModule,
    CacheModule,
  ],
  controllers: [KitchenItemController],
  providers: [KitchenItemService],
  exports: [KitchenItemService],
})
export class KitchenItemModule {}