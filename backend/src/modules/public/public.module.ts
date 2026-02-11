import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { PublicService } from './providers/public.service';
import { ItemModule } from '../items/item.module';
import { CategoryModule } from '../categories/category.module';
import { TableModule } from '../table/table.module';

@Module({
  imports: [ItemModule, CategoryModule, TableModule],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}
