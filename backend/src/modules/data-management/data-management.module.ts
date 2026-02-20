import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

// --- Local entities ---
import { BackupHistory } from './entities/backup-history.entity';
import { BackupSettings } from './entities/backup-settings.entity';

// --- External entities (used by export / import / backup services) ---
import { User } from '../users/entities/user.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Item } from '../items/entities/item.entity';
import { Category } from '../categories/entities/category.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../order-items/entities/order-item.entity';
import { OrderToken } from '../order-tokens/entities/order-token.entity';
import { Table } from '../table/entities/table.entity';
import { Discount } from '../discount/entities/discount.entity';
import { Expenses } from '../expenses/entities/expenses.entity';
import { ExpenseCategory } from '../expense-categories/entities/expense-categories.entity';
import { Salary } from '../staff-salary/entities/salary.entity';
import { StuffAttendance } from '../stuff-attendance/entities/stuff-attendance.entity';
import { Leave } from '../stuff-leave/entities/leave.entity';
import { KitchenItems } from '../kitchen-items/entities/kitchen-item.entity';
import { DailyReport } from '../reports/entities/report.entity';
import { Bank } from '../banks/entities/bank.entity';
import { ItemVariation } from '../items/entities/item-variation.entity';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Activity } from '../reports/entities/activity.entity';
import { DiscountApplication } from '../discount-application/entities/discount-application.entities';

// --- Cache ---
import { CacheModule } from '../cache/cache.module';

// --- Cloudinary ---
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

// --- Services ---
import { ExportService } from './providers/export.service';
import { ImportService } from './providers/import.service';
import { BackupService } from './providers/backup.service';
import { GoogleDriveService } from './providers/google-drive.service';
import { BackupSchedulerService } from './providers/backup-scheduler.service';

// --- Controllers ---
import { ExportController } from './controllers/export.controller';
import { ImportController } from './controllers/import.controller';
import { BackupController } from './controllers/backup.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Local entities
      BackupHistory,
      BackupSettings,
      // External entities
      User,
      Customer,
      Item,
      Category,
      Order,
      OrderItem,
      OrderToken,
      Table,
      Discount,
      Expenses,
      ExpenseCategory,
      Salary,
      StuffAttendance,
      Leave,
      KitchenItems,
      DailyReport,
      Bank,
      ItemVariation,
      Cart,
      CartItem,
      Activity,
      DiscountApplication,
    ]),
    ScheduleModule.forRoot(),
    CacheModule,
    CloudinaryModule,
  ],
  controllers: [ExportController, ImportController, BackupController],
  providers: [
    ExportService,
    ImportService,
    BackupService,
    GoogleDriveService,
    BackupSchedulerService,
  ],
  exports: [ExportService, ImportService, BackupService],
})
export class DataManagementModule {}
