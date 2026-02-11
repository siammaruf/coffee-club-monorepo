import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TableController } from './table.controller';
import { TableService } from './providers/table.service';
import { Table } from './entities/table.entity';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [TypeOrmModule.forFeature([Table]), CacheModule],
  controllers: [TableController],
  providers: [TableService],
  exports: [TableService],
})
export class TableModule {}