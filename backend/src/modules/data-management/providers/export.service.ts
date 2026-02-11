import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, SelectQueryBuilder } from 'typeorm';
import * as ExcelJS from 'exceljs';

import { User } from '../../users/entities/user.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Item } from '../../items/entities/item.entity';
import { Category } from '../../categories/entities/category.entity';
import { Order } from '../../orders/entities/order.entity';
import { OrderItem } from '../../order-items/entities/order-item.entity';
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

import { ExportGroup } from '../enums/export-group.enum';
import { ExportDataDto } from '../dto/export-data.dto';
import { ExportGroupInfo } from '../interfaces/backup-metadata.interface';

/** Column definition used for building Excel worksheets. */
interface ColumnDef {
  header: string;
  key: string;
  width: number;
}

/** Describes one sheet inside an export group. */
interface SheetConfig {
  name: string;
  columns: ColumnDef[];
  getData: (dateFrom?: string, dateTo?: string) => Promise<Record<string, any>[]>;
}

/** Maps each ExportGroup to its metadata and sheet definitions. */
interface GroupConfig {
  label: string;
  description: string;
  entities: string[];
  sheets: SheetConfig[];
  getCount: () => Promise<number>;
}

@Injectable()
export class ExportService {
  constructor(
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
    private readonly kitchenItemRepo: Repository<KitchenItems>,
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
    private readonly dataSource: DataSource,
  ) {}

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /** Return all available export groups with current record counts. */
  async getExportGroups(): Promise<ExportGroupInfo[]> {
    const configs = this.getGroupConfigs();
    const groups: ExportGroupInfo[] = [];

    for (const [group, config] of Object.entries(configs)) {
      const record_count = await config.getCount();
      groups.push({
        group,
        label: config.label,
        description: config.description,
        entities: config.entities,
        record_count,
      });
    }

    return groups;
  }

  /** Export the requested groups to an Excel buffer. */
  async exportToExcel(dto: ExportDataDto): Promise<Buffer> {
    if (!dto.groups || dto.groups.length === 0) {
      throw new BadRequestException('At least one export group must be selected');
    }

    const configs = this.getGroupConfigs();
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'CoffeeClub';
    workbook.created = new Date();

    for (const group of dto.groups) {
      const config = configs[group];
      if (!config) {
        throw new BadRequestException(`Unknown export group: ${group}`);
      }

      for (const sheet of config.sheets) {
        const data = await sheet.getData(dto.date_from, dto.date_to);
        this.addWorksheet(workbook, sheet.name, sheet.columns, data);
      }
    }

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }

  /** Generate a blank template (headers only) for the given group. */
  async generateTemplate(group: ExportGroup): Promise<Buffer> {
    const configs = this.getGroupConfigs();
    const config = configs[group];

    if (!config) {
      throw new BadRequestException(`Unknown export group: ${group}`);
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'CoffeeClub';
    workbook.created = new Date();

    for (const sheet of config.sheets) {
      this.addWorksheet(workbook, sheet.name, sheet.columns, []);
    }

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }

  // ---------------------------------------------------------------------------
  // Group configuration registry
  // ---------------------------------------------------------------------------

  private getGroupConfigs(): Record<ExportGroup, GroupConfig> {
    return {
      [ExportGroup.MENU]: {
        label: 'Menu',
        description: 'Items, categories, and item-category mappings',
        entities: ['Item', 'Category', 'ItemCategories'],
        sheets: [
          {
            name: 'Items',
            columns: this.getItemColumns(),
            getData: (from, to) => this.fetchItems(from, to),
          },
          {
            name: 'Categories',
            columns: this.getCategoryColumns(),
            getData: (from, to) => this.fetchCategories(from, to),
          },
          {
            name: 'Item-Categories',
            columns: this.getItemCategoryColumns(),
            getData: () => this.fetchItemCategories(),
          },
        ],
        getCount: async () => {
          const items = await this.itemRepo.count();
          const cats = await this.categoryRepo.count();
          return items + cats;
        },
      },

      [ExportGroup.ORDERS]: {
        label: 'Orders',
        description: 'Orders with line items and table assignments',
        entities: ['Order', 'OrderItem', 'OrderTables'],
        sheets: [
          {
            name: 'Orders',
            columns: this.getOrderColumns(),
            getData: (from, to) => this.fetchOrders(from, to),
          },
          {
            name: 'Order Items',
            columns: this.getOrderItemColumns(),
            getData: (from, to) => this.fetchOrderItems(from, to),
          },
        ],
        getCount: async () => this.orderRepo.count(),
      },

      [ExportGroup.CUSTOMERS]: {
        label: 'Customers',
        description: 'Customer records (sensitive fields excluded)',
        entities: ['Customer'],
        sheets: [
          {
            name: 'Customers',
            columns: this.getCustomerColumns(),
            getData: (from, to) => this.fetchCustomers(from, to),
          },
        ],
        getCount: async () => this.customerRepo.count(),
      },

      [ExportGroup.STAFF]: {
        label: 'Staff',
        description: 'Staff users and bank account details',
        entities: ['User', 'Bank'],
        sheets: [
          {
            name: 'Users',
            columns: this.getUserColumns(),
            getData: (from, to) => this.fetchUsers(from, to),
          },
          {
            name: 'Banks',
            columns: this.getBankColumns(),
            getData: (from, to) => this.fetchBanks(from, to),
          },
        ],
        getCount: async () => {
          const users = await this.userRepo.count();
          const banks = await this.bankRepo.count();
          return users + banks;
        },
      },

      [ExportGroup.ATTENDANCE]: {
        label: 'Attendance',
        description: 'Staff attendance, salary, and leave records',
        entities: ['StuffAttendance', 'Salary', 'Leave'],
        sheets: [
          {
            name: 'Attendance',
            columns: this.getAttendanceColumns(),
            getData: (from, to) => this.fetchAttendance(from, to),
          },
          {
            name: 'Salary',
            columns: this.getSalaryColumns(),
            getData: (from, to) => this.fetchSalaries(from, to),
          },
          {
            name: 'Leave',
            columns: this.getLeaveColumns(),
            getData: () => this.fetchLeaves(),
          },
        ],
        getCount: async () => {
          const att = await this.attendanceRepo.count();
          const sal = await this.salaryRepo.count();
          const lv = await this.leaveRepo.count();
          return att + sal + lv;
        },
      },

      [ExportGroup.KITCHEN]: {
        label: 'Kitchen',
        description: 'Kitchen items, stock, orders, and order items',
        entities: ['KitchenItems', 'KitchenStock', 'KitchenOrder', 'KitchenOrderItem'],
        sheets: [
          {
            name: 'Kitchen Items',
            columns: this.getKitchenItemColumns(),
            getData: () => this.fetchKitchenItems(),
          },
          {
            name: 'Kitchen Stock',
            columns: this.getKitchenStockColumns(),
            getData: () => this.fetchKitchenStock(),
          },
          {
            name: 'Kitchen Orders',
            columns: this.getKitchenOrderColumns(),
            getData: (from, to) => this.fetchKitchenOrders(from, to),
          },
          {
            name: 'Kitchen Order Items',
            columns: this.getKitchenOrderItemColumns(),
            getData: () => this.fetchKitchenOrderItems(),
          },
        ],
        getCount: async () => {
          const ki = await this.kitchenItemRepo.count();
          const ks = await this.kitchenStockRepo.count();
          const ko = await this.kitchenOrderRepo.count();
          return ki + ks + ko;
        },
      },

      [ExportGroup.FINANCIAL]: {
        label: 'Financial',
        description: 'Expenses and expense categories',
        entities: ['Expenses', 'ExpenseCategory'],
        sheets: [
          {
            name: 'Expenses',
            columns: this.getExpenseColumns(),
            getData: (from, to) => this.fetchExpenses(from, to),
          },
          {
            name: 'Expense Categories',
            columns: this.getExpenseCategoryColumns(),
            getData: (from, to) => this.fetchExpenseCategories(from, to),
          },
        ],
        getCount: async () => {
          const exp = await this.expensesRepo.count();
          const cats = await this.expenseCategoryRepo.count();
          return exp + cats;
        },
      },

      [ExportGroup.DISCOUNTS]: {
        label: 'Discounts',
        description: 'Discount definitions',
        entities: ['Discount'],
        sheets: [
          {
            name: 'Discounts',
            columns: this.getDiscountColumns(),
            getData: (from, to) => this.fetchDiscounts(from, to),
          },
        ],
        getCount: async () => this.discountRepo.count(),
      },

      [ExportGroup.TABLES]: {
        label: 'Tables',
        description: 'Restaurant table definitions',
        entities: ['Table'],
        sheets: [
          {
            name: 'Tables',
            columns: this.getTableColumns(),
            getData: (from, to) => this.fetchTables(from, to),
          },
        ],
        getCount: async () => this.tableRepo.count(),
      },

      [ExportGroup.REPORTS]: {
        label: 'Reports',
        description: 'Daily sales reports',
        entities: ['DailyReport'],
        sheets: [
          {
            name: 'Daily Reports',
            columns: this.getDailyReportColumns(),
            getData: (from, to) => this.fetchDailyReports(from, to),
          },
        ],
        getCount: async () => this.dailyReportRepo.count(),
      },
    };
  }

  // ---------------------------------------------------------------------------
  // Excel helpers
  // ---------------------------------------------------------------------------

  /** Create a worksheet with styled header and data rows. */
  private addWorksheet(
    workbook: ExcelJS.Workbook,
    sheetName: string,
    columns: ColumnDef[],
    data: Record<string, any>[],
  ): void {
    const worksheet = workbook.addWorksheet(sheetName);
    worksheet.columns = columns.map((col) => ({
      header: col.header,
      key: col.key,
      width: col.width,
    }));

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 11 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE2E8F0' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 22;

    // Add data rows
    for (const record of data) {
      const rowData: Record<string, any> = {};
      for (const col of columns) {
        const value = record[col.key];
        rowData[col.key] = value instanceof Date ? value.toISOString() : (value ?? '');
      }
      worksheet.addRow(rowData);
    }

    // Auto-filter on the header row
    if (columns.length > 0) {
      worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: columns.length },
      };
    }
  }

  // ---------------------------------------------------------------------------
  // Date-range helper
  // ---------------------------------------------------------------------------

  /** Apply optional date-range filtering on a QueryBuilder's created_at column. */
  private applyDateFilter<T>(
    qb: SelectQueryBuilder<T>,
    alias: string,
    dateFrom?: string,
    dateTo?: string,
  ): SelectQueryBuilder<T> {
    if (dateFrom) {
      qb.andWhere(`${alias}.created_at >= :dateFrom`, { dateFrom });
    }
    if (dateTo) {
      qb.andWhere(`${alias}.created_at <= :dateTo`, {
        dateTo: `${dateTo}T23:59:59.999Z`,
      });
    }
    return qb;
  }

  // ---------------------------------------------------------------------------
  // MENU group
  // ---------------------------------------------------------------------------

  private getItemColumns(): ColumnDef[] {
    return [
      { header: 'ID', key: 'id', width: 38 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Name (BN)', key: 'name_bn', width: 25 },
      { header: 'Slug', key: 'slug', width: 25 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Type', key: 'type', width: 12 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Regular Price', key: 'regular_price', width: 15 },
      { header: 'Sale Price', key: 'sale_price', width: 15 },
      { header: 'Image', key: 'image', width: 50 },
      { header: 'Created At', key: 'created_at', width: 22 },
      { header: 'Updated At', key: 'updated_at', width: 22 },
    ];
  }

  private async fetchItems(dateFrom?: string, dateTo?: string): Promise<Record<string, any>[]> {
    const qb = this.itemRepo.createQueryBuilder('item');
    this.applyDateFilter(qb, 'item', dateFrom, dateTo);
    qb.orderBy('item.created_at', 'ASC');
    const items = await qb.getMany();
    return items.map((i) => ({
      id: i.id,
      name: i.name,
      name_bn: i.name_bn,
      slug: i.slug,
      description: i.description,
      type: i.type,
      status: i.status,
      regular_price: i.regular_price,
      sale_price: i.sale_price,
      image: i.image,
      created_at: i.created_at,
      updated_at: i.updated_at,
    }));
  }

  private getCategoryColumns(): ColumnDef[] {
    return [
      { header: 'ID', key: 'id', width: 38 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Name (BN)', key: 'name_bn', width: 25 },
      { header: 'Slug', key: 'slug', width: 25 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Icon', key: 'icon', width: 30 },
      { header: 'Created At', key: 'created_at', width: 22 },
      { header: 'Updated At', key: 'updated_at', width: 22 },
    ];
  }

  private async fetchCategories(dateFrom?: string, dateTo?: string): Promise<Record<string, any>[]> {
    const qb = this.categoryRepo.createQueryBuilder('cat');
    this.applyDateFilter(qb, 'cat', dateFrom, dateTo);
    qb.orderBy('cat.created_at', 'ASC');
    const cats = await qb.getMany();
    return cats.map((c) => ({
      id: c.id,
      name: c.name,
      name_bn: c.name_bn,
      slug: c.slug,
      description: c.description,
      icon: c.icon,
      created_at: c.created_at,
      updated_at: c.updated_at,
    }));
  }

  private getItemCategoryColumns(): ColumnDef[] {
    return [
      { header: 'Item ID', key: 'item_id', width: 38 },
      { header: 'Category ID', key: 'category_id', width: 38 },
    ];
  }

  private async fetchItemCategories(): Promise<Record<string, any>[]> {
    const tableName = this.resolveTableName('item_categories');
    const rows: { item_id: string; category_id: string }[] = await this.dataSource.query(
      `SELECT "item_id", "category_id" FROM "${tableName}" ORDER BY "item_id"`,
    );
    return rows;
  }

  // ---------------------------------------------------------------------------
  // ORDERS group
  // ---------------------------------------------------------------------------

  private getOrderColumns(): ColumnDef[] {
    return [
      { header: 'ID', key: 'id', width: 38 },
      { header: 'Order ID', key: 'order_id', width: 20 },
      { header: 'Order Type', key: 'order_type', width: 14 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Customer ID', key: 'customer_id', width: 38 },
      { header: 'User ID', key: 'user_id', width: 38 },
      { header: 'Sub Total', key: 'sub_total', width: 14 },
      { header: 'Total Amount', key: 'total_amount', width: 14 },
      { header: 'Discount ID', key: 'discount_id', width: 38 },
      { header: 'Discount Amount', key: 'discount_amount', width: 16 },
      { header: 'Completion Time', key: 'completion_time', width: 16 },
      { header: 'Payment Method', key: 'payment_method', width: 16 },
      { header: 'Order Source', key: 'order_source', width: 14 },
      { header: 'Delivery Address', key: 'delivery_address', width: 30 },
      { header: 'Special Instructions', key: 'special_instructions', width: 30 },
      { header: 'Customer Phone', key: 'customer_phone', width: 18 },
      { header: 'Table IDs', key: 'table_ids', width: 50 },
      { header: 'Created At', key: 'created_at', width: 22 },
      { header: 'Updated At', key: 'updated_at', width: 22 },
    ];
  }

  private async fetchOrders(dateFrom?: string, dateTo?: string): Promise<Record<string, any>[]> {
    const qb = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.discount', 'discount')
      .leftJoinAndSelect('order.tables', 'tables');
    this.applyDateFilter(qb, 'order', dateFrom, dateTo);
    qb.orderBy('order.created_at', 'ASC');
    const orders = await qb.getMany();

    return orders.map((o) => ({
      id: o.id,
      order_id: o.order_id,
      order_type: o.order_type,
      status: o.status,
      customer_id: o.customer?.id ?? '',
      user_id: o.user?.id ?? '',
      sub_total: o.sub_total,
      total_amount: o.total_amount,
      discount_id: o.discount?.id ?? '',
      discount_amount: o.discount_amount,
      completion_time: o.completion_time,
      payment_method: o.payment_method,
      order_source: o.order_source,
      delivery_address: o.delivery_address,
      special_instructions: o.special_instructions,
      customer_phone: o.customer_phone,
      table_ids: o.tables ? o.tables.map((t) => t.id).join(', ') : '',
      created_at: o.created_at,
      updated_at: o.updated_at,
    }));
  }

  private getOrderItemColumns(): ColumnDef[] {
    return [
      { header: 'ID', key: 'id', width: 38 },
      { header: 'Order ID', key: 'order_id', width: 38 },
      { header: 'Item ID', key: 'item_id', width: 38 },
      { header: 'Item Name', key: 'item_name', width: 25 },
      { header: 'Quantity', key: 'quantity', width: 10 },
      { header: 'Unit Price', key: 'unit_price', width: 14 },
      { header: 'Total Price', key: 'total_price', width: 14 },
      { header: 'Created At', key: 'created_at', width: 22 },
      { header: 'Updated At', key: 'updated_at', width: 22 },
    ];
  }

  private async fetchOrderItems(dateFrom?: string, dateTo?: string): Promise<Record<string, any>[]> {
    const qb = this.orderItemRepo
      .createQueryBuilder('oi')
      .leftJoinAndSelect('oi.order', 'order')
      .leftJoinAndSelect('oi.item', 'item');
    this.applyDateFilter(qb, 'oi', dateFrom, dateTo);
    qb.orderBy('oi.created_at', 'ASC');
    const items = await qb.getMany();

    return items.map((oi) => ({
      id: oi.id,
      order_id: oi.order?.id ?? '',
      item_id: oi.item?.id ?? '',
      item_name: oi.item?.name ?? '',
      quantity: oi.quantity,
      unit_price: oi.unit_price,
      total_price: oi.total_price,
      created_at: oi.created_at,
      updated_at: oi.updated_at,
    }));
  }

  // ---------------------------------------------------------------------------
  // CUSTOMERS group
  // ---------------------------------------------------------------------------

  private getCustomerColumns(): ColumnDef[] {
    return [
      { header: 'ID', key: 'id', width: 38 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Phone', key: 'phone', width: 18 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Address', key: 'address', width: 35 },
      { header: 'Note', key: 'note', width: 30 },
      { header: 'Picture', key: 'picture', width: 50 },
      { header: 'Is Verified', key: 'is_verified', width: 12 },
      { header: 'Points', key: 'points', width: 12 },
      { header: 'Balance', key: 'balance', width: 12 },
      { header: 'Is Active', key: 'is_active', width: 12 },
      { header: 'Created At', key: 'created_at', width: 22 },
      { header: 'Updated At', key: 'updated_at', width: 22 },
    ];
  }

  private async fetchCustomers(dateFrom?: string, dateTo?: string): Promise<Record<string, any>[]> {
    const qb = this.customerRepo.createQueryBuilder('cust');
    this.applyDateFilter(qb, 'cust', dateFrom, dateTo);
    qb.orderBy('cust.created_at', 'ASC');
    const customers = await qb.getMany();

    // Exclude sensitive fields: password, refresh_token, otp
    return customers.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email,
      address: c.address,
      note: c.note,
      picture: c.picture,
      is_verified: c.is_verified,
      points: c.points,
      balance: c.balance,
      is_active: c.is_active,
      created_at: c.created_at,
      updated_at: c.updated_at,
    }));
  }

  // ---------------------------------------------------------------------------
  // STAFF group
  // ---------------------------------------------------------------------------

  private getUserColumns(): ColumnDef[] {
    return [
      { header: 'ID', key: 'id', width: 38 },
      { header: 'First Name', key: 'first_name', width: 20 },
      { header: 'Last Name', key: 'last_name', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 18 },
      { header: 'NID Number', key: 'nid_number', width: 20 },
      { header: 'NID Front Picture', key: 'nid_front_picture', width: 50 },
      { header: 'NID Back Picture', key: 'nid_back_picture', width: 50 },
      { header: 'Address', key: 'address', width: 35 },
      { header: 'Date Joined', key: 'date_joined', width: 22 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Role', key: 'role', width: 12 },
      { header: 'Picture', key: 'picture', width: 50 },
      { header: 'Base Salary', key: 'base_salary', width: 14 },
      { header: 'Created At', key: 'created_at', width: 22 },
      { header: 'Updated At', key: 'updated_at', width: 22 },
    ];
  }

  private async fetchUsers(dateFrom?: string, dateTo?: string): Promise<Record<string, any>[]> {
    const qb = this.userRepo.createQueryBuilder('user');
    this.applyDateFilter(qb, 'user', dateFrom, dateTo);
    qb.orderBy('user.created_at', 'ASC');
    const users = await qb.getMany();

    // Exclude sensitive field: password
    return users.map((u) => ({
      id: u.id,
      first_name: u.first_name,
      last_name: u.last_name,
      email: u.email,
      phone: u.phone,
      nid_number: u.nid_number,
      nid_front_picture: u.nid_front_picture,
      nid_back_picture: u.nid_back_picture,
      address: u.address,
      date_joined: u.date_joined,
      status: u.status,
      role: u.role,
      picture: u.picture,
      base_salary: u.base_salary,
      created_at: u.created_at,
      updated_at: u.updated_at,
    }));
  }

  private getBankColumns(): ColumnDef[] {
    return [
      { header: 'ID', key: 'id', width: 38 },
      { header: 'Bank Name', key: 'bank_name', width: 25 },
      { header: 'Branch Name', key: 'branch_name', width: 25 },
      { header: 'Account Number', key: 'account_number', width: 25 },
      { header: 'Routing Number', key: 'routing_number', width: 20 },
      { header: 'User ID', key: 'user_id', width: 38 },
      { header: 'Created At', key: 'created_at', width: 22 },
      { header: 'Updated At', key: 'updated_at', width: 22 },
    ];
  }

  private async fetchBanks(dateFrom?: string, dateTo?: string): Promise<Record<string, any>[]> {
    const qb = this.bankRepo
      .createQueryBuilder('bank')
      .leftJoinAndSelect('bank.user', 'user');
    this.applyDateFilter(qb, 'bank', dateFrom, dateTo);
    qb.orderBy('bank.created_at', 'ASC');
    const banks = await qb.getMany();

    return banks.map((b) => ({
      id: b.id,
      bank_name: b.bank_name,
      branch_name: b.branch_name,
      account_number: b.account_number,
      routing_number: b.routing_number,
      user_id: b.user?.id ?? '',
      created_at: b.created_at,
      updated_at: b.updated_at,
    }));
  }

  // ---------------------------------------------------------------------------
  // ATTENDANCE group
  // ---------------------------------------------------------------------------

  private getAttendanceColumns(): ColumnDef[] {
    return [
      { header: 'ID', key: 'id', width: 38 },
      { header: 'User ID', key: 'user_id', width: 38 },
      { header: 'Attendance Date', key: 'attendance_date', width: 16 },
      { header: 'Check In', key: 'check_in', width: 14 },
      { header: 'Check Out', key: 'check_out', width: 14 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Work Hours', key: 'work_hours', width: 12 },
      { header: 'Overtime Hours', key: 'overtime_hours', width: 14 },
      { header: 'Notes', key: 'notes', width: 30 },
      { header: 'Approved By', key: 'approved_by', width: 38 },
      { header: 'Is Approved', key: 'is_approved', width: 12 },
      { header: 'Created At', key: 'created_at', width: 22 },
      { header: 'Updated At', key: 'updated_at', width: 22 },
    ];
  }

  private async fetchAttendance(dateFrom?: string, dateTo?: string): Promise<Record<string, any>[]> {
    const qb = this.attendanceRepo
      .createQueryBuilder('att')
      .leftJoinAndSelect('att.user', 'user');
    this.applyDateFilter(qb, 'att', dateFrom, dateTo);
    qb.orderBy('att.created_at', 'ASC');
    const records = await qb.getMany();

    return records.map((a) => ({
      id: a.id,
      user_id: a.user?.id ?? '',
      attendance_date: a.attendance_date,
      check_in: a.check_in,
      check_out: a.check_out,
      status: a.status,
      work_hours: a.work_hours,
      overtime_hours: a.overtime_hours,
      notes: a.notes,
      approved_by: a.approved_by,
      is_approved: a.is_approved,
      created_at: a.created_at,
      updated_at: a.updated_at,
    }));
  }

  private getSalaryColumns(): ColumnDef[] {
    return [
      { header: 'ID', key: 'id', width: 38 },
      { header: 'User ID', key: 'user_id', width: 38 },
      { header: 'Month', key: 'month', width: 16 },
      { header: 'Base Salary', key: 'base_salary', width: 14 },
      { header: 'Bonus', key: 'bonus', width: 12 },
      { header: 'Deductions', key: 'deductions', width: 12 },
      { header: 'Total Payable', key: 'total_payble', width: 14 },
      { header: 'Receipt Image', key: 'receipt_image', width: 50 },
      { header: 'Is Paid', key: 'is_paid', width: 10 },
      { header: 'Notes', key: 'notes', width: 30 },
      { header: 'Created At', key: 'created_at', width: 22 },
      { header: 'Updated At', key: 'updated_at', width: 22 },
    ];
  }

  private async fetchSalaries(dateFrom?: string, dateTo?: string): Promise<Record<string, any>[]> {
    const qb = this.salaryRepo
      .createQueryBuilder('sal')
      .leftJoinAndSelect('sal.user', 'user');
    this.applyDateFilter(qb, 'sal', dateFrom, dateTo);
    qb.orderBy('sal.created_at', 'ASC');
    const salaries = await qb.getMany();

    return salaries.map((s) => ({
      id: s.id,
      user_id: s.user?.id ?? '',
      month: s.month,
      base_salary: s.base_salary,
      bonus: s.bonus,
      deductions: s.deductions,
      total_payble: s.total_payble,
      receipt_image: s.receipt_image,
      is_paid: s.is_paid,
      notes: s.notes,
      created_at: s.created_at,
      updated_at: s.updated_at,
    }));
  }

  private getLeaveColumns(): ColumnDef[] {
    return [
      { header: 'ID', key: 'id', width: 38 },
      { header: 'User ID', key: 'user_id', width: 38 },
      { header: 'Leave Type', key: 'leave_type', width: 16 },
      { header: 'Leave Start Date', key: 'leave_start_date', width: 18 },
      { header: 'Leave End Date', key: 'leave_end_date', width: 18 },
      { header: 'Reason', key: 'reason', width: 30 },
      { header: 'Status', key: 'status', width: 14 },
    ];
  }

  private async fetchLeaves(): Promise<Record<string, any>[]> {
    // Leave entity has no created_at column, so no date filtering
    const leaves = await this.leaveRepo.find({ relations: ['user'] });

    return leaves.map((l) => ({
      id: l.id,
      user_id: l.user_id,
      leave_type: l.leave_type,
      leave_start_date: l.leave_start_date,
      leave_end_date: l.leave_end_date,
      reason: l.reason,
      status: l.status,
    }));
  }

  // ---------------------------------------------------------------------------
  // KITCHEN group
  // ---------------------------------------------------------------------------

  private getKitchenItemColumns(): ColumnDef[] {
    return [
      { header: 'ID', key: 'id', width: 38 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Name (BN)', key: 'name_bn', width: 25 },
      { header: 'Slug', key: 'slug', width: 25 },
      { header: 'Image', key: 'image', width: 50 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Type', key: 'type', width: 14 },
      { header: 'Created At', key: 'created_at', width: 22 },
      { header: 'Updated At', key: 'updated_at', width: 22 },
    ];
  }

  private async fetchKitchenItems(): Promise<Record<string, any>[]> {
    // KitchenItems entity uses plain columns for timestamps, no @CreateDateColumn
    const items = await this.kitchenItemRepo.find();
    return items.map((ki) => ({
      id: ki.id,
      name: ki.name,
      name_bn: ki.name_bn,
      slug: ki.slug,
      image: ki.image,
      description: ki.description,
      type: ki.type,
      created_at: ki.created_at,
      updated_at: ki.updated_at,
    }));
  }

  private getKitchenStockColumns(): ColumnDef[] {
    return [
      { header: 'ID', key: 'id', width: 38 },
      { header: 'Kitchen Item ID', key: 'kitchen_item_id', width: 38 },
      { header: 'Kitchen Item Name', key: 'kitchen_item_name', width: 25 },
      { header: 'Quantity', key: 'quantity', width: 12 },
      { header: 'Price', key: 'price', width: 14 },
      { header: 'Total Price', key: 'total_price', width: 14 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Created At', key: 'created_at', width: 22 },
      { header: 'Updated At', key: 'updated_at', width: 22 },
    ];
  }

  private async fetchKitchenStock(): Promise<Record<string, any>[]> {
    const stocks = await this.kitchenStockRepo.find({ relations: ['kitchen_item'] });
    return stocks.map((ks) => ({
      id: ks.id,
      kitchen_item_id: ks.kitchen_item?.id ?? '',
      kitchen_item_name: ks.kitchen_item?.name ?? '',
      quantity: ks.quantity,
      price: ks.price,
      total_price: ks.total_price,
      description: ks.description,
      created_at: ks.created_at,
      updated_at: ks.updated_at,
    }));
  }

  private getKitchenOrderColumns(): ColumnDef[] {
    return [
      { header: 'ID', key: 'id', width: 38 },
      { header: 'Order ID', key: 'order_id', width: 20 },
      { header: 'User ID', key: 'user_id', width: 38 },
      { header: 'Total Amount', key: 'total_amount', width: 14 },
      { header: 'Is Approved', key: 'is_approved', width: 12 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Created At', key: 'created_at', width: 22 },
      { header: 'Updated At', key: 'updated_at', width: 22 },
    ];
  }

  private async fetchKitchenOrders(dateFrom?: string, dateTo?: string): Promise<Record<string, any>[]> {
    const qb = this.kitchenOrderRepo
      .createQueryBuilder('ko')
      .leftJoinAndSelect('ko.user', 'user');
    this.applyDateFilter(qb, 'ko', dateFrom, dateTo);
    qb.orderBy('ko.created_at', 'ASC');
    const orders = await qb.getMany();

    return orders.map((ko) => ({
      id: ko.id,
      order_id: ko.order_id,
      user_id: ko.user?.id ?? '',
      total_amount: ko.total_amount,
      is_approved: ko.is_approved,
      description: ko.description,
      created_at: ko.created_at,
      updated_at: ko.updated_at,
    }));
  }

  private getKitchenOrderItemColumns(): ColumnDef[] {
    return [
      { header: 'ID', key: 'id', width: 38 },
      { header: 'Kitchen Order ID', key: 'kitchen_order_id', width: 38 },
      { header: 'Kitchen Stock ID', key: 'kitchen_stock_id', width: 38 },
      { header: 'Quantity', key: 'quantity', width: 12 },
      { header: 'Unit Price', key: 'unit_price', width: 14 },
      { header: 'Total Price', key: 'total_price', width: 14 },
      { header: 'Created At', key: 'created_at', width: 22 },
      { header: 'Updated At', key: 'updated_at', width: 22 },
    ];
  }

  private async fetchKitchenOrderItems(): Promise<Record<string, any>[]> {
    const items = await this.kitchenOrderItemRepo.find({
      relations: ['kitchen_order', 'kitchen_stock'],
    });
    return items.map((koi) => ({
      id: koi.id,
      kitchen_order_id: koi.kitchen_order?.id ?? '',
      kitchen_stock_id: koi.kitchen_stock?.id ?? '',
      quantity: koi.quantity,
      unit_price: koi.unit_price,
      total_price: koi.total_price,
      created_at: koi.created_at,
      updated_at: koi.updated_at,
    }));
  }

  // ---------------------------------------------------------------------------
  // FINANCIAL group
  // ---------------------------------------------------------------------------

  private getExpenseColumns(): ColumnDef[] {
    return [
      { header: 'ID', key: 'id', width: 38 },
      { header: 'Title', key: 'title', width: 25 },
      { header: 'Amount', key: 'amount', width: 14 },
      { header: 'Category ID', key: 'category_id', width: 38 },
      { header: 'Category Name', key: 'category_name', width: 25 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Receipt Reference', key: 'receipt_reference', width: 30 },
      { header: 'Created At', key: 'created_at', width: 22 },
      { header: 'Updated At', key: 'updated_at', width: 22 },
    ];
  }

  private async fetchExpenses(dateFrom?: string, dateTo?: string): Promise<Record<string, any>[]> {
    const qb = this.expensesRepo
      .createQueryBuilder('exp')
      .leftJoinAndSelect('exp.category', 'category');
    this.applyDateFilter(qb, 'exp', dateFrom, dateTo);
    qb.orderBy('exp.created_at', 'ASC');
    const expenses = await qb.getMany();

    return expenses.map((e) => ({
      id: e.id,
      title: e.title,
      amount: e.amount,
      category_id: e.category?.id ?? '',
      category_name: e.category?.name ?? '',
      description: e.description,
      status: e.status,
      receipt_reference: e.receipt_reference,
      created_at: e.created_at,
      updated_at: e.updated_at,
    }));
  }

  private getExpenseCategoryColumns(): ColumnDef[] {
    return [
      { header: 'ID', key: 'id', width: 38 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Slug', key: 'slug', width: 25 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Icon', key: 'icon', width: 30 },
      { header: 'Created At', key: 'created_at', width: 22 },
      { header: 'Updated At', key: 'updated_at', width: 22 },
    ];
  }

  private async fetchExpenseCategories(dateFrom?: string, dateTo?: string): Promise<Record<string, any>[]> {
    const qb = this.expenseCategoryRepo.createQueryBuilder('ec');
    this.applyDateFilter(qb, 'ec', dateFrom, dateTo);
    qb.orderBy('ec.created_at', 'ASC');
    const cats = await qb.getMany();

    return cats.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      icon: c.icon,
      created_at: c.created_at,
      updated_at: c.updated_at,
    }));
  }

  // ---------------------------------------------------------------------------
  // DISCOUNTS group
  // ---------------------------------------------------------------------------

  private getDiscountColumns(): ColumnDef[] {
    return [
      { header: 'ID', key: 'id', width: 38 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Discount Type', key: 'discount_type', width: 16 },
      { header: 'Discount Value', key: 'discount_value', width: 16 },
      { header: 'Expiry Date', key: 'expiry_date', width: 22 },
      { header: 'Created At', key: 'created_at', width: 22 },
      { header: 'Updated At', key: 'updated_at', width: 22 },
    ];
  }

  private async fetchDiscounts(dateFrom?: string, dateTo?: string): Promise<Record<string, any>[]> {
    const qb = this.discountRepo.createQueryBuilder('disc');
    this.applyDateFilter(qb, 'disc', dateFrom, dateTo);
    qb.orderBy('disc.created_at', 'ASC');
    const discounts = await qb.getMany();

    return discounts.map((d) => ({
      id: d.id,
      name: d.name,
      discount_type: d.discount_type,
      discount_value: d.discount_value,
      expiry_date: d.expiry_date,
      created_at: d.created_at,
      updated_at: d.updated_at,
    }));
  }

  // ---------------------------------------------------------------------------
  // TABLES group
  // ---------------------------------------------------------------------------

  private getTableColumns(): ColumnDef[] {
    return [
      { header: 'ID', key: 'id', width: 38 },
      { header: 'Number', key: 'number', width: 12 },
      { header: 'Seat', key: 'seat', width: 10 },
      { header: 'Description', key: 'description', width: 30 },
      { header: 'Location', key: 'location', width: 20 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Created At', key: 'created_at', width: 22 },
      { header: 'Updated At', key: 'updated_at', width: 22 },
    ];
  }

  private async fetchTables(dateFrom?: string, dateTo?: string): Promise<Record<string, any>[]> {
    const qb = this.tableRepo.createQueryBuilder('tbl');
    this.applyDateFilter(qb, 'tbl', dateFrom, dateTo);
    qb.orderBy('tbl.created_at', 'ASC');
    const tables = await qb.getMany();

    return tables.map((t) => ({
      id: t.id,
      number: t.number,
      seat: t.seat,
      description: t.description,
      location: t.location,
      status: t.status,
      created_at: t.created_at,
      updated_at: t.updated_at,
    }));
  }

  // ---------------------------------------------------------------------------
  // REPORTS group
  // ---------------------------------------------------------------------------

  private getDailyReportColumns(): ColumnDef[] {
    return [
      { header: 'ID', key: 'id', width: 38 },
      { header: 'Report Date', key: 'report_date', width: 16 },
      { header: 'Total Sales', key: 'total_sales', width: 14 },
      { header: 'Bar Sales', key: 'bar_sales', width: 14 },
      { header: 'Kitchen Sales', key: 'kitchen_sales', width: 14 },
      { header: 'Total Orders', key: 'total_orders', width: 14 },
      { header: 'Bar Orders', key: 'bar_orders', width: 12 },
      { header: 'Kitchen Orders', key: 'kitchen_orders', width: 14 },
      { header: 'Total Expenses', key: 'total_expenses', width: 14 },
      { header: 'Total Expense Items', key: 'total_expense_items', width: 18 },
      { header: 'Credit Amount', key: 'credit_amount', width: 14 },
      { header: 'Is Auto Generated', key: 'is_auto_generated', width: 16 },
      { header: 'Generated At', key: 'generated_at', width: 22 },
      { header: 'Created At', key: 'created_at', width: 22 },
      { header: 'Updated At', key: 'updated_at', width: 22 },
    ];
  }

  private async fetchDailyReports(dateFrom?: string, dateTo?: string): Promise<Record<string, any>[]> {
    const qb = this.dailyReportRepo.createQueryBuilder('dr');
    this.applyDateFilter(qb, 'dr', dateFrom, dateTo);
    qb.orderBy('dr.report_date', 'ASC');
    const reports = await qb.getMany();

    return reports.map((r) => ({
      id: r.id,
      report_date: r.report_date,
      total_sales: r.total_sales,
      bar_sales: r.bar_sales,
      kitchen_sales: r.kitchen_sales,
      total_orders: r.total_orders,
      bar_orders: r.bar_orders,
      kitchen_orders: r.kitchen_orders,
      total_expenses: r.total_expenses,
      total_expense_items: r.total_expense_items,
      credit_amount: r.credit_amount,
      is_auto_generated: r.is_auto_generated,
      generated_at: r.generated_at,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));
  }

  // ---------------------------------------------------------------------------
  // Table name resolution (handles entityPrefix)
  // ---------------------------------------------------------------------------

  /**
   * Resolves the actual database table name by applying the entity prefix
   * configured in TypeORM (DB_TABLE_PREFIX, e.g. "cc_").
   */
  private resolveTableName(baseName: string): string {
    const prefix = this.dataSource.options['entityPrefix'] || '';
    return `${prefix}${baseName}`;
  }
}
