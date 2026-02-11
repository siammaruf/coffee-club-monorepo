import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { promisify } from 'util';
import * as zlib from 'zlib';
import * as crypto from 'crypto';

import { BackupHistory } from '../entities/backup-history.entity';
import { BackupType } from '../enums/backup-type.enum';
import { BackupStatus } from '../enums/backup-status.enum';
import { BackupData, BackupMetadata } from '../interfaces/backup-metadata.interface';
import { GoogleDriveService } from './google-drive.service';

import { User } from '../../users/entities/user.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Item } from '../../items/entities/item.entity';
import { Category } from '../../categories/entities/category.entity';
import { Order } from '../../orders/entities/order.entity';
import { OrderItem } from '../../order-items/entities/order-item.entity';
import { OrderToken } from '../../order-tokens/entities/order-token.entity';
import { Table } from '../../table/entities/table.entity';
import { Discount } from '../../discount/entities/discount.entity';
import { Expenses } from '../../expenses/entities/expenses.entity';
import { ExpenseCategory } from '../../expense-categories/entities/expense-categories.entity';
import { Salary } from '../../staff-salary/entities/salary.entity';
import { StuffAttendance } from '../../stuff-attendance/entities/stuff-attendance.entity';
import { Leave } from '../../stuff-leave/entities/leave.entity';
import { KitchenItems } from '../../kitchen-items/entities/kitchen-item.entity';
import { KitchenStock } from '../../kitchen-stock/entities/kitchen-stock.entity';
import { KitchenOrder } from '../../kitchen-orders/entities/kitchen-order.entity';
import { KitchenOrderItem } from '../../kitchen-orders/entities/kitchen-order-item.entity';
import { DailyReport } from '../../reports/entities/report.entity';
import { Bank } from '../../banks/entities/bank.entity';
import { Cart } from '../../cart/entities/cart.entity';
import { CartItem } from '../../cart/entities/cart-item.entity';
import { Activity } from '../../reports/entities/activity.entity';
import { DiscountApplication } from '../../discount-application/entities/discount-application.entities';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly tablePrefix: string;

  constructor(
    @InjectRepository(BackupHistory)
    private readonly historyRepo: Repository<BackupHistory>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Item)
    private readonly itemRepo: Repository<Item>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(OrderToken)
    private readonly orderTokenRepo: Repository<OrderToken>,
    @InjectRepository(Table)
    private readonly tableRepo: Repository<Table>,
    @InjectRepository(Discount)
    private readonly discountRepo: Repository<Discount>,
    @InjectRepository(Expenses)
    private readonly expensesRepo: Repository<Expenses>,
    @InjectRepository(ExpenseCategory)
    private readonly expenseCategoryRepo: Repository<ExpenseCategory>,
    @InjectRepository(Salary)
    private readonly salaryRepo: Repository<Salary>,
    @InjectRepository(StuffAttendance)
    private readonly attendanceRepo: Repository<StuffAttendance>,
    @InjectRepository(Leave)
    private readonly leaveRepo: Repository<Leave>,
    @InjectRepository(KitchenItems)
    private readonly kitchenItemsRepo: Repository<KitchenItems>,
    @InjectRepository(KitchenStock)
    private readonly kitchenStockRepo: Repository<KitchenStock>,
    @InjectRepository(KitchenOrder)
    private readonly kitchenOrderRepo: Repository<KitchenOrder>,
    @InjectRepository(KitchenOrderItem)
    private readonly kitchenOrderItemRepo: Repository<KitchenOrderItem>,
    @InjectRepository(DailyReport)
    private readonly dailyReportRepo: Repository<DailyReport>,
    @InjectRepository(Bank)
    private readonly bankRepo: Repository<Bank>,
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepo: Repository<CartItem>,
    @InjectRepository(Activity)
    private readonly activityRepo: Repository<Activity>,
    @InjectRepository(DiscountApplication)
    private readonly discountApplicationRepo: Repository<DiscountApplication>,
    private readonly googleDriveService: GoogleDriveService,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    this.tablePrefix = this.configService.get<string>('DB_TABLE_PREFIX', '');
  }

  async createBackup(
    user?: User,
    type: BackupType = BackupType.MANUAL,
  ): Promise<BackupHistory> {
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .slice(0, 19);
    const filename = `backup_${timestamp}.ccbak`;

    const history = new BackupHistory();
    history.filename = filename;
    history.type = type;
    history.status = BackupStatus.IN_PROGRESS;
    if (user) {
      history.created_by = user;
    }
    const savedHistory = await this.historyRepo.save(history);

    try {
      this.logger.log(`Starting ${type} backup: ${filename}`);

      const backupData = await this.dumpDatabase();
      const compressedBuffer = await this.compressBackup(backupData);

      savedHistory.status = BackupStatus.UPLOADING;
      savedHistory.file_size = compressedBuffer.length;
      savedHistory.total_records = backupData.metadata.total_records;
      savedHistory.entity_counts = backupData.metadata.entity_counts;
      await this.historyRepo.save(savedHistory);

      const uploadResult =
        await this.googleDriveService.uploadFile(compressedBuffer, filename);

      if (uploadResult) {
        savedHistory.google_drive_file_id = uploadResult.fileId;
      }

      savedHistory.status = BackupStatus.COMPLETED;
      await this.historyRepo.save(savedHistory);

      this.logger.log(
        `Backup completed: ${filename} (${compressedBuffer.length} bytes, ${backupData.metadata.total_records} records)`,
      );

      return savedHistory;
    } catch (error) {
      savedHistory.status = BackupStatus.FAILED;
      savedHistory.error_message =
        error instanceof Error ? error.message : String(error);
      await this.historyRepo.save(savedHistory);

      this.logger.error(
        `Backup failed: ${filename}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        `Backup failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async dumpDatabase(): Promise<BackupData> {
    const entityCounts: Record<string, number> = {};
    const data: Record<string, any[]> = {};

    // Dump users (exclude password)
    const users = await this.userRepo.find();
    data['users'] = users.map(({ password, ...rest }) => rest);
    entityCounts['users'] = data['users'].length;

    // Dump customers (exclude password, refresh_token, otp)
    const customers = await this.customerRepo.find();
    data['customers'] = customers.map(
      ({ password, refresh_token, otp, ...rest }) => rest,
    );
    entityCounts['customers'] = data['customers'].length;

    // Dump categories
    const categories = await this.categoryRepo.find();
    data['categories'] = categories;
    entityCounts['categories'] = categories.length;

    // Dump items
    const items = await this.itemRepo.find();
    data['items'] = items;
    entityCounts['items'] = items.length;

    // Dump tables
    const tables = await this.tableRepo.find();
    data['tables'] = tables;
    entityCounts['tables'] = tables.length;

    // Dump discounts
    const discounts = await this.discountRepo.find();
    data['discounts'] = discounts;
    entityCounts['discounts'] = discounts.length;

    // Dump discount_applications
    const discountApplications = await this.discountApplicationRepo.find({
      relations: ['discount', 'customers', 'products', 'categories'],
    });
    data['discount_applications'] = discountApplications;
    entityCounts['discount_applications'] = discountApplications.length;

    // Dump expense_categories
    const expenseCategories = await this.expenseCategoryRepo.find();
    data['expense_categories'] = expenseCategories;
    entityCounts['expense_categories'] = expenseCategories.length;

    // Dump expenses
    const expenses = await this.expensesRepo.find({ relations: ['category'] });
    data['expenses'] = expenses;
    entityCounts['expenses'] = expenses.length;

    // Dump orders
    const orders = await this.orderRepo.find({
      relations: ['customer', 'user', 'discount'],
    });
    data['orders'] = orders;
    entityCounts['orders'] = orders.length;

    // Dump order_items
    const orderItems = await this.orderItemRepo.find({
      relations: ['order', 'item'],
    });
    data['order_items'] = orderItems;
    entityCounts['order_items'] = orderItems.length;

    // Dump order_tokens
    const orderTokens = await this.orderTokenRepo.find({
      relations: ['order', 'order_items'],
    });
    data['order_tokens'] = orderTokens;
    entityCounts['order_tokens'] = orderTokens.length;

    // Dump salaries
    const salaries = await this.salaryRepo.find({ relations: ['user'] });
    data['salaries'] = salaries;
    entityCounts['salaries'] = salaries.length;

    // Dump stuff_attendance
    const attendance = await this.attendanceRepo.find({
      relations: ['user'],
    });
    data['stuff_attendance'] = attendance;
    entityCounts['stuff_attendance'] = attendance.length;

    // Dump leaves
    const leaves = await this.leaveRepo.find({ relations: ['user'] });
    data['leaves'] = leaves;
    entityCounts['leaves'] = leaves.length;

    // Dump kitchen_items
    const kitchenItems = await this.kitchenItemsRepo.find();
    data['kitchen_items'] = kitchenItems;
    entityCounts['kitchen_items'] = kitchenItems.length;

    // Dump kitchen_stock
    const kitchenStock = await this.kitchenStockRepo.find({
      relations: ['kitchen_item'],
    });
    data['kitchen_stock'] = kitchenStock;
    entityCounts['kitchen_stock'] = kitchenStock.length;

    // Dump kitchen_orders
    const kitchenOrders = await this.kitchenOrderRepo.find({
      relations: ['user', 'order_items'],
    });
    data['kitchen_orders'] = kitchenOrders;
    entityCounts['kitchen_orders'] = kitchenOrders.length;

    // Dump kitchen_order_items
    const kitchenOrderItems = await this.kitchenOrderItemRepo.find({
      relations: ['kitchen_order', 'kitchen_stock'],
    });
    data['kitchen_order_items'] = kitchenOrderItems;
    entityCounts['kitchen_order_items'] = kitchenOrderItems.length;

    // Dump daily_reports
    const dailyReports = await this.dailyReportRepo.find();
    data['daily_reports'] = dailyReports;
    entityCounts['daily_reports'] = dailyReports.length;

    // Dump banks
    const banks = await this.bankRepo.find({ relations: ['user'] });
    data['banks'] = banks;
    entityCounts['banks'] = banks.length;

    // Dump carts
    const carts = await this.cartRepo.find({ relations: ['customer'] });
    data['carts'] = carts;
    entityCounts['carts'] = carts.length;

    // Dump cart_items
    const cartItems = await this.cartItemRepo.find({
      relations: ['cart', 'item'],
    });
    data['cart_items'] = cartItems;
    entityCounts['cart_items'] = cartItems.length;

    // Dump activities
    const activities = await this.activityRepo.find({
      relations: ['user', 'customer'],
    });
    data['activities'] = activities;
    entityCounts['activities'] = activities.length;

    // Dump junction tables via raw queries
    try {
      const itemCategories = await this.dataSource.query(
        `SELECT * FROM "${this.tablePrefix}item_categories"`,
      );
      data['item_categories'] = itemCategories;
      entityCounts['item_categories'] = itemCategories.length;
    } catch {
      data['item_categories'] = [];
      entityCounts['item_categories'] = 0;
    }

    try {
      const orderTables = await this.dataSource.query(
        `SELECT * FROM "${this.tablePrefix}order_tables"`,
      );
      data['order_tables'] = orderTables;
      entityCounts['order_tables'] = orderTables.length;
    } catch {
      data['order_tables'] = [];
      entityCounts['order_tables'] = 0;
    }

    try {
      const orderTokenItems = await this.dataSource.query(
        `SELECT * FROM "${this.tablePrefix}order_token_items"`,
      );
      data['order_token_items'] = orderTokenItems;
      entityCounts['order_token_items'] = orderTokenItems.length;
    } catch {
      data['order_token_items'] = [];
      entityCounts['order_token_items'] = 0;
    }

    try {
      const discountAppCustomers = await this.dataSource.query(
        `SELECT * FROM "${this.tablePrefix}discount_application_customers"`,
      );
      data['discount_application_customers'] = discountAppCustomers;
      entityCounts['discount_application_customers'] =
        discountAppCustomers.length;
    } catch {
      data['discount_application_customers'] = [];
      entityCounts['discount_application_customers'] = 0;
    }

    try {
      const discountAppProducts = await this.dataSource.query(
        `SELECT * FROM "${this.tablePrefix}discount_application_products"`,
      );
      data['discount_application_products'] = discountAppProducts;
      entityCounts['discount_application_products'] =
        discountAppProducts.length;
    } catch {
      data['discount_application_products'] = [];
      entityCounts['discount_application_products'] = 0;
    }

    try {
      const discountAppCategories = await this.dataSource.query(
        `SELECT * FROM "${this.tablePrefix}discount_application_categories"`,
      );
      data['discount_application_categories'] = discountAppCategories;
      entityCounts['discount_application_categories'] =
        discountAppCategories.length;
    } catch {
      data['discount_application_categories'] = [];
      entityCounts['discount_application_categories'] = 0;
    }

    const totalRecords = Object.values(entityCounts).reduce(
      (sum, count) => sum + count,
      0,
    );

    const jsonString = JSON.stringify(data);
    const checksum = crypto
      .createHash('md5')
      .update(jsonString)
      .digest('hex');

    const metadata: BackupMetadata = {
      version: '1.0.0',
      created_at: new Date().toISOString(),
      table_prefix: this.tablePrefix,
      entity_counts: entityCounts,
      total_records: totalRecords,
      checksum,
    };

    return { metadata, data };
  }

  private async compressBackup(backupData: BackupData): Promise<Buffer> {
    const jsonString = JSON.stringify(backupData);
    const compressed = await gzip(Buffer.from(jsonString, 'utf-8'));
    return Buffer.from(compressed);
  }

  private async decompressBackup(buffer: Buffer): Promise<BackupData> {
    const decompressed = await gunzip(buffer);
    return JSON.parse(decompressed.toString('utf-8')) as BackupData;
  }

  async restoreFromBackup(backupId: string): Promise<void> {
    const backup = await this.historyRepo.findOne({
      where: { id: backupId },
    });

    if (!backup) {
      throw new NotFoundException(`Backup with ID "${backupId}" not found`);
    }

    if (!backup.google_drive_file_id) {
      throw new BadRequestException(
        'Backup file is not available on Google Drive',
      );
    }

    this.logger.log(`Starting restore from backup: ${backup.filename}`);

    const buffer = await this.googleDriveService.downloadFile(
      backup.google_drive_file_id,
    );
    const backupData = await this.decompressBackup(buffer);

    const jsonString = JSON.stringify(backupData.data);
    const checksum = crypto
      .createHash('md5')
      .update(jsonString)
      .digest('hex');

    if (checksum !== backupData.metadata.checksum) {
      throw new BadRequestException(
        'Backup data integrity check failed. The backup file may be corrupted.',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Disable foreign key checks for the session
      await queryRunner.query(
        `SET session_replication_role = 'replica'`,
      );

      const prefix = this.tablePrefix;

      // Truncate all entity tables (junction tables first, then entities)
      const junctionTables = [
        'discount_application_categories',
        'discount_application_products',
        'discount_application_customers',
        'order_token_items',
        'order_tables',
        'item_categories',
      ];

      for (const table of junctionTables) {
        await queryRunner.query(
          `TRUNCATE TABLE "${prefix}${table}" CASCADE`,
        );
      }

      const entityTables = [
        'cart_items',
        'carts',
        'activities',
        'daily_reports',
        'kitchen_order_items',
        'kitchen_orders',
        'kitchen_stock',
        'kitchen_items',
        'leaves',
        'stuff_attendance',
        'salaries',
        'order_tokens',
        'order_items',
        'orders',
        'discount_applications',
        'expenses',
        'expense_categories',
        'discounts',
        'tables',
        'items',
        'categories',
        'banks',
        'customers',
        'users',
      ];

      for (const table of entityTables) {
        await queryRunner.query(
          `TRUNCATE TABLE "${prefix}${table}" CASCADE`,
        );
      }

      // Insert data in dependency order (parent entities first)
      const insertOrder: Array<{
        key: string;
        table: string;
      }> = [
        { key: 'users', table: 'users' },
        { key: 'customers', table: 'customers' },
        { key: 'categories', table: 'categories' },
        { key: 'items', table: 'items' },
        { key: 'tables', table: 'tables' },
        { key: 'discounts', table: 'discounts' },
        { key: 'discount_applications', table: 'discount_applications' },
        { key: 'expense_categories', table: 'expense_categories' },
        { key: 'expenses', table: 'expenses' },
        { key: 'orders', table: 'orders' },
        { key: 'order_items', table: 'order_items' },
        { key: 'order_tokens', table: 'order_tokens' },
        { key: 'salaries', table: 'salaries' },
        { key: 'stuff_attendance', table: 'stuff_attendance' },
        { key: 'leaves', table: 'leaves' },
        { key: 'kitchen_items', table: 'kitchen_items' },
        { key: 'kitchen_stock', table: 'kitchen_stock' },
        { key: 'kitchen_orders', table: 'kitchen_orders' },
        { key: 'kitchen_order_items', table: 'kitchen_order_items' },
        { key: 'daily_reports', table: 'daily_reports' },
        { key: 'banks', table: 'banks' },
        { key: 'carts', table: 'carts' },
        { key: 'cart_items', table: 'cart_items' },
        { key: 'activities', table: 'activities' },
      ];

      for (const { key, table } of insertOrder) {
        const records = backupData.data[key];
        if (records && records.length > 0) {
          await this.insertRecords(queryRunner, `${prefix}${table}`, records);
        }
      }

      // Insert junction table data
      const junctionData: Array<{ key: string; table: string }> = [
        { key: 'item_categories', table: 'item_categories' },
        { key: 'order_tables', table: 'order_tables' },
        { key: 'order_token_items', table: 'order_token_items' },
        {
          key: 'discount_application_customers',
          table: 'discount_application_customers',
        },
        {
          key: 'discount_application_products',
          table: 'discount_application_products',
        },
        {
          key: 'discount_application_categories',
          table: 'discount_application_categories',
        },
      ];

      for (const { key, table } of junctionData) {
        const records = backupData.data[key];
        if (records && records.length > 0) {
          await this.insertRecords(queryRunner, `${prefix}${table}`, records);
        }
      }

      // Re-enable foreign key checks
      await queryRunner.query(
        `SET session_replication_role = 'origin'`,
      );

      await queryRunner.commitTransaction();

      this.logger.log(
        `Restore completed from backup: ${backup.filename}`,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();

      // Ensure FK checks are re-enabled even on failure
      try {
        await queryRunner.query(
          `SET session_replication_role = 'origin'`,
        );
      } catch {
        // Ignore if already rolled back
      }

      this.logger.error(
        `Restore failed from backup: ${backup.filename}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new InternalServerErrorException(
        `Restore failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  private async insertRecords(
    queryRunner: any,
    tableName: string,
    records: any[],
  ): Promise<void> {
    if (records.length === 0) return;

    // Filter out relation objects, keep only primitive fields
    const firstRecord = records[0];
    const columns = Object.keys(firstRecord).filter((key) => {
      const value = firstRecord[key];
      return (
        value === null ||
        value === undefined ||
        typeof value !== 'object' ||
        value instanceof Date ||
        (typeof value === 'string')
      );
    });

    if (columns.length === 0) return;

    const BATCH_SIZE = 500;
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      const columnNames = columns
        .map((col) => `"${col}"`)
        .join(', ');
      const valuePlaceholders: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      for (const record of batch) {
        const rowPlaceholders: string[] = [];
        for (const col of columns) {
          rowPlaceholders.push(`$${paramIndex}`);
          let val = record[col];
          // Handle nested objects that should be stored as JSON
          if (val !== null && val !== undefined && typeof val === 'object' && !(val instanceof Date)) {
            val = JSON.stringify(val);
          }
          params.push(val ?? null);
          paramIndex++;
        }
        valuePlaceholders.push(`(${rowPlaceholders.join(', ')})`);
      }

      const sql = `INSERT INTO "${tableName}" (${columnNames}) VALUES ${valuePlaceholders.join(', ')} ON CONFLICT DO NOTHING`;
      await queryRunner.query(sql, params);
    }
  }

  async previewBackup(backupId: string): Promise<BackupMetadata> {
    const backup = await this.historyRepo.findOne({
      where: { id: backupId },
    });

    if (!backup) {
      throw new NotFoundException(`Backup with ID "${backupId}" not found`);
    }

    if (!backup.google_drive_file_id) {
      throw new BadRequestException(
        'Backup file is not available on Google Drive',
      );
    }

    const buffer = await this.googleDriveService.downloadFile(
      backup.google_drive_file_id,
    );
    const backupData = await this.decompressBackup(buffer);

    return backupData.metadata;
  }

  async getHistory(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    items: BackupHistory[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const [items, total] = await this.historyRepo.findAndCount({
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['created_by'],
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findHistoryById(id: string): Promise<BackupHistory> {
    const backup = await this.historyRepo.findOne({
      where: { id },
      relations: ['created_by'],
    });

    if (!backup) {
      throw new NotFoundException(`Backup with ID "${id}" not found`);
    }

    return backup;
  }

  async deleteBackup(id: string): Promise<void> {
    const backup = await this.historyRepo.findOne({ where: { id } });

    if (!backup) {
      throw new NotFoundException(`Backup with ID "${id}" not found`);
    }

    if (backup.google_drive_file_id) {
      await this.googleDriveService.deleteFile(backup.google_drive_file_id);
    }

    await this.historyRepo.remove(backup);

    this.logger.log(`Deleted backup: ${backup.filename}`);
  }

  async deleteOldBackups(
    retentionDays: number,
    maxBackups: number,
  ): Promise<void> {
    // Delete backups older than retention_days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const oldBackups = await this.historyRepo.find({
      where: {
        created_at: LessThan(cutoffDate),
        status: BackupStatus.COMPLETED,
      },
    });

    for (const backup of oldBackups) {
      if (backup.google_drive_file_id) {
        await this.googleDriveService.deleteFile(backup.google_drive_file_id);
      }
      await this.historyRepo.remove(backup);
      this.logger.log(
        `Deleted old backup (retention): ${backup.filename}`,
      );
    }

    // Delete excess backups beyond max_backups (keep newest)
    const allCompleted = await this.historyRepo.find({
      where: { status: BackupStatus.COMPLETED },
      order: { created_at: 'DESC' },
    });

    if (allCompleted.length > maxBackups) {
      const excessBackups = allCompleted.slice(maxBackups);
      for (const backup of excessBackups) {
        if (backup.google_drive_file_id) {
          await this.googleDriveService.deleteFile(
            backup.google_drive_file_id,
          );
        }
        await this.historyRepo.remove(backup);
        this.logger.log(
          `Deleted excess backup (max count): ${backup.filename}`,
        );
      }
    }
  }
}
