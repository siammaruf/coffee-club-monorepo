import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ExpenseCategoriesController } from './expense-categories.controller';
import { ExpenseCategoriesService } from './providers/expense-categories.service';
import { ExpenseCategory } from './entities/expense-categories.entity';
import { CacheModule } from '../cache/cache.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExpenseCategory]),
    MulterModule.register({
      dest: './uploads',
    }),
    CacheModule,
    CloudinaryModule,
  ],
  controllers: [ExpenseCategoriesController],
  providers: [ExpenseCategoriesService],
  exports: [ExpenseCategoriesService]
})
export class ExpenseCategoriesModule {}