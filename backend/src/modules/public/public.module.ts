import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { PublicService } from './providers/public.service';
import { ItemModule } from '../items/item.module';
import { CategoryModule } from '../categories/category.module';
import { TableModule } from '../table/table.module';
import { BlogModule } from '../blog/blog.module';
import { ReservationsModule } from '../reservations/reservations.module';
import { PartnersModule } from '../partners/partners.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [ItemModule, CategoryModule, TableModule, BlogModule, ReservationsModule, PartnersModule, SettingsModule],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}
