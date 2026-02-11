import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expenses } from './entities/expenses.entity';
import { ExpenseCategory } from '../expense-categories/entities/expense-categories.entity';
import { ExpensesService } from './providers/expenses.service';
import { ExpensesController } from './expenses.controller';
import { ExpenseCategoriesModule } from '../expense-categories/expense-categories.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expenses, ExpenseCategory]),
    ExpenseCategoriesModule,
    CacheModule
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService],
  exports: [ExpensesService],
})
export class ExpensesModule {}