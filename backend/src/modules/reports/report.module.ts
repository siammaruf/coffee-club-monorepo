import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportService } from './providers/report.service';
import { ActivityService } from './providers/activity.service';
import { SalesReportController } from './controllers/report.controller';
import { ActivityController } from './controllers/activity.controller';
import { DailyReport } from './entities/report.entity';
import { Activity } from './entities/activity.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderToken } from '../order-tokens/entities/order-token.entity';
import { Expenses } from '../expenses/entities/expenses.entity';
import { User } from '../users/entities/user.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Table } from '../table/entities/table.entity';
import { Item } from '../items/entities/item.entity';
import { CacheModule } from '../cache/cache.module';
import { KitchenReportsModule } from '../kitchen-reports/kitchen-reports.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DailyReport,
      Activity,
      Order,
      OrderToken,
      Expenses,
      User,
      Customer,
      Table,
      Item,
    ]),
    CacheModule,
    KitchenReportsModule,
  ],
  controllers: [SalesReportController, ActivityController],
  providers: [ReportService, ActivityService],
  exports: [ReportService, ActivityService]
})
export class ReportModule {}