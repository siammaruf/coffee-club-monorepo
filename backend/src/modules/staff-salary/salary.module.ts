import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalaryController } from './salary.controller';
import { SalaryService } from './providers/salary.service';
import { Salary } from './entities/salary.entity';
import { User } from '../users/entities/user.entity';
import { ExpensesModule } from '../expenses/expenses.module';
import { ExpenseCategoriesModule } from '../expense-categories/expense-categories.module';
import { CacheModule } from '../cache/cache.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Salary, User]),
        ExpensesModule,
        ExpenseCategoriesModule,
        CacheModule
    ],
    controllers: [SalaryController],
    providers: [SalaryService],
    exports: [SalaryService]
})
export class SalaryModule {}