import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import * as ExcelJS from 'exceljs';

import { ImportMode } from '../enums/import-mode.enum';
import { ImportDataDto } from '../dto/import-data.dto';
import {
  ImportPreview,
  ImportPreviewSheet,
  ImportResult,
} from '../interfaces/backup-metadata.interface';

// Entities
import { Category } from '../../categories/entities/category.entity';
import { ExpenseCategory } from '../../expense-categories/entities/expense-categories.entity';
import { Table } from '../../table/entities/table.entity';
import { KitchenItems } from '../../kitchen-items/entities/kitchen-item.entity';
import { User } from '../../users/entities/user.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Discount } from '../../discount/entities/discount.entity';
import { Item } from '../../items/entities/item.entity';
import { Bank } from '../../banks/entities/bank.entity';
import { KitchenStock } from '../../kitchen-stock/entities/kitchen-stock.entity';
import { Order } from '../../orders/entities/order.entity';
import { OrderItem } from '../../order-items/entities/order-item.entity';
import { OrderToken } from '../../order-tokens/entities/order-token.entity';
import { Salary } from '../../staff-salary/entities/salary.entity';
import { StuffAttendance } from '../../stuff-attendance/entities/stuff-attendance.entity';
import { Leave } from '../../stuff-leave/entities/leave.entity';
import { Expenses } from '../../expenses/entities/expenses.entity';
import { KitchenOrder } from '../../kitchen-orders/entities/kitchen-order.entity';
import { KitchenOrderItem } from '../../kitchen-orders/entities/kitchen-order-item.entity';
import { DailyReport } from '../../reports/entities/report.entity';

// Enums for validation
import { ItemType } from '../../items/enum/item-type.enum';
import { ItemStatus } from '../../items/enum/item-status.enum';
import { OrderType } from '../../orders/enum/order-type.enum';
import { OrderStatus } from '../../orders/enum/order-status.enum';
import { PaymentMethod } from '../../orders/enum/payment-method.enum';
import { TableStatus } from '../../table/enum/table-status.enum';
import { DiscountType } from '../../discount/enum/discount-type.enum';
import { ExpenseStatus } from '../../expenses/enum/expense-status.enum';
import { AttendanceStatus } from '../../stuff-attendance/enum/attendance-status.enum';
import { LeaveStatus } from '../../stuff-leave/enum/leave-status.enum';
import { UserStatus } from '../../users/enum/user-status.enum';
import { UserRole } from '../../users/enum/user-role.enum';
import { KitchenItemType } from '../../kitchen-items/enum/kitchen-item-type.enum';
import { TokenType } from '../../order-tokens/enum/TokenType.enum';
import { OrderTokenPriority } from '../../order-tokens/enum/OrderTokenPriority.enum';
import { OrderTokenStatus } from '../../order-tokens/enum/OrderTokenStatus.enum';

/**
 * Defines how a sheet maps to an entity including column definitions
 * for type conversion and validation.
 */
interface SheetEntityMapping {
  entityName: string;
  tableName: string;
  columns: Record<string, ColumnDef>;
  requiredFields: string[];
  /** Fields to skip during import (e.g., password) */
  skipFields: string[];
  /**
   * Remap normalized header names to entity property names.
   * Key = normalized snake_case header, Value = actual entity property name.
   * Used for entities with camelCase properties (e.g., OrderToken: "ready_at" -> "readyAt").
   */
  fieldRemap: Record<string, string>;
  /**
   * Maps FK column header names to relation property names on the entity.
   * During row conversion, "customer_id: 'uuid'" becomes "customer: { id: 'uuid' }".
   * Key = normalized snake_case FK column, Value = relation property name.
   */
  relationMappings: Record<string, string>;
}

interface ColumnDef {
  type: 'string' | 'number' | 'decimal' | 'integer' | 'boolean' | 'date' | 'timestamp' | 'uuid' | 'enum' | 'time';
  enumValues?: string[];
  nullable?: boolean;
}

/** UUID v4 regex for validation */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class ImportService {
  private readonly logger = new Logger(ImportService.name);

  /** Sheet name -> entity mapping with column definitions */
  private readonly sheetMappings: Record<string, SheetEntityMapping>;

  constructor(
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(ExpenseCategory) private expenseCategoryRepo: Repository<ExpenseCategory>,
    @InjectRepository(Table) private tableRepo: Repository<Table>,
    @InjectRepository(KitchenItems) private kitchenItemRepo: Repository<KitchenItems>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    @InjectRepository(Discount) private discountRepo: Repository<Discount>,
    @InjectRepository(Item) private itemRepo: Repository<Item>,
    @InjectRepository(Bank) private bankRepo: Repository<Bank>,
    @InjectRepository(KitchenStock) private kitchenStockRepo: Repository<KitchenStock>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private orderItemRepo: Repository<OrderItem>,
    @InjectRepository(OrderToken) private orderTokenRepo: Repository<OrderToken>,
    @InjectRepository(Salary) private salaryRepo: Repository<Salary>,
    @InjectRepository(StuffAttendance) private attendanceRepo: Repository<StuffAttendance>,
    @InjectRepository(Leave) private leaveRepo: Repository<Leave>,
    @InjectRepository(Expenses) private expensesRepo: Repository<Expenses>,
    @InjectRepository(KitchenOrder) private kitchenOrderRepo: Repository<KitchenOrder>,
    @InjectRepository(KitchenOrderItem) private kitchenOrderItemRepo: Repository<KitchenOrderItem>,
    @InjectRepository(DailyReport) private dailyReportRepo: Repository<DailyReport>,
    private dataSource: DataSource,
  ) {
    this.sheetMappings = this.buildSheetMappings();
  }

  // ---------------------------------------------------------------------------
  // PUBLIC API
  // ---------------------------------------------------------------------------

  /**
   * Parse an uploaded Excel file and return a preview of what will be imported,
   * including row counts and per-row validation errors.
   */
  async parseAndPreview(file: Express.Multer.File): Promise<ImportPreview> {
    this.validateFile(file);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer);

    const sheets: ImportPreviewSheet[] = [];
    let totalRows = 0;
    let totalErrors = 0;

    workbook.eachSheet((worksheet) => {
      const sheetName = worksheet.name;
      const mapping = this.sheetMappings[sheetName];

      if (!mapping) {
        sheets.push({
          sheet_name: sheetName,
          entity_type: 'unknown',
          total_rows: 0,
          valid_rows: 0,
          error_rows: 0,
          errors: [{ row: 0, field: '', message: `Unknown sheet "${sheetName}" -- will be skipped during import` }],
        });
        totalErrors += 1;
        return;
      }

      const { headers, dataRows } = this.extractSheetData(worksheet);
      const errors: Array<{ row: number; field: string; message: string }> = [];

      for (const { rowNumber, rowData } of dataRows) {
        const rowErrors = this.validateRow(rowData, headers, mapping);
        for (const err of rowErrors) {
          errors.push({ row: rowNumber, field: err.field, message: err.message });
        }
      }

      const errorRowNumbers = new Set(errors.map((e) => e.row));
      const sheet: ImportPreviewSheet = {
        sheet_name: sheetName,
        entity_type: mapping.entityName,
        total_rows: dataRows.length,
        valid_rows: dataRows.length - errorRowNumbers.size,
        error_rows: errorRowNumbers.size,
        errors,
      };

      sheets.push(sheet);
      totalRows += dataRows.length;
      totalErrors += errors.length;
    });

    return { sheets, total_rows: totalRows, total_errors: totalErrors };
  }

  /**
   * Execute the import: parse the Excel file, validate, and persist data
   * inside a single database transaction (or with skip_errors support).
   */
  async executeImport(
    file: Express.Multer.File,
    dto: ImportDataDto,
  ): Promise<ImportResult> {
    this.validateFile(file);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer);

    // Collect parsed data per sheet keyed by sheet name
    const parsedSheets = new Map<
      string,
      { mapping: SheetEntityMapping; rows: Record<string, any>[] }
    >();

    workbook.eachSheet((worksheet) => {
      const sheetName = worksheet.name;
      const mapping = this.sheetMappings[sheetName];
      if (!mapping) return;

      const { headers, dataRows } = this.extractSheetData(worksheet);
      const rows: Record<string, any>[] = [];

      for (const { rowData } of dataRows) {
        const converted = this.convertRow(rowData, headers, mapping);
        if (converted) rows.push(converted);
      }

      parsedSheets.set(sheetName, { mapping, rows });
    });

    // Define import phases (dependency order)
    const importPhases: string[][] = [
      // Phase 1: no FK dependencies
      ['Categories', 'Expense Categories', 'Tables', 'Kitchen Items'],
      // Phase 2: depend on phase 1
      ['Users', 'Customers', 'Discounts'],
      // Phase 3: depend on phase 2
      ['Items', 'Banks', 'Kitchen Stock'],
      // Phase 3.5: junction table for Item <-> Category
      ['Item-Categories'],
      // Phase 4: depend on phase 3
      ['Orders', 'Expenses', 'Daily Reports'],
      // Phase 5: depend on phase 4
      ['Order Items', 'Order Tokens', 'Salary', 'Attendance', 'Leave', 'Kitchen Orders'],
      // Phase 6: depend on phase 5
      ['Kitchen Order Items'],
    ];

    const importedCounts: Record<string, number> = {};
    const skippedCounts: Record<string, number> = {};
    const errors: Array<{ entity: string; row: number; message: string }> = [];

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const phase of importPhases) {
        for (const sheetName of phase) {
          const sheetData = parsedSheets.get(sheetName);
          if (!sheetData) continue;

          const { mapping, rows } = sheetData;
          let imported = 0;
          let skipped = 0;

          // Special handling for junction table
          if (sheetName === 'Item-Categories') {
            const result = await this.importJunctionTable(
              queryRunner,
              rows,
              dto,
              errors,
            );
            importedCounts['Item-Categories'] = result.imported;
            skippedCounts['Item-Categories'] = result.skipped;
            continue;
          }

          const repo = this.getRepository(mapping.entityName);
          if (!repo) {
            this.logger.warn(`No repository found for entity: ${mapping.entityName}`);
            continue;
          }

          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            try {
              if (dto.mode === ImportMode.UPSERT) {
                await queryRunner.manager.getRepository(repo.target).upsert(row, ['id']);
              } else {
                // INSERT mode: save, but catch unique constraint errors
                await queryRunner.manager.getRepository(repo.target).save(
                  queryRunner.manager.getRepository(repo.target).create(row),
                );
              }
              imported++;
            } catch (err: any) {
              const message = err?.message || 'Unknown error';
              const isConstraintError =
                message.includes('duplicate key') ||
                message.includes('unique constraint') ||
                message.includes('UNIQUE constraint') ||
                err?.code === '23505';

              if (dto.skip_errors || (dto.mode === ImportMode.INSERT && isConstraintError)) {
                skipped++;
                errors.push({
                  entity: mapping.entityName,
                  row: i + 2, // +2 because row 1 is header, data starts at row 2
                  message: isConstraintError
                    ? `Duplicate record skipped (id: ${row.id || 'unknown'})`
                    : message,
                });
              } else {
                throw new BadRequestException(
                  `Import failed at ${mapping.entityName} row ${i + 2}: ${message}`,
                );
              }
            }
          }

          importedCounts[mapping.entityName] = imported;
          skippedCounts[mapping.entityName] = skipped;
        }
      }

      await queryRunner.commitTransaction();

      return {
        success: true,
        imported_counts: importedCounts,
        skipped_counts: skippedCounts,
        errors,
      };
    } catch (err: any) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Import transaction rolled back', err?.stack);

      if (err instanceof BadRequestException) throw err;

      throw new BadRequestException(
        `Import failed: ${err?.message || 'Unknown error'}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  // ---------------------------------------------------------------------------
  // PRIVATE HELPERS
  // ---------------------------------------------------------------------------

  /**
   * Validate the uploaded file is present and has an xlsx content type / extension.
   */
  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('Uploaded file is empty');
    }
    const validMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/octet-stream',
    ];
    if (file.mimetype && !validMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type "${file.mimetype}". Only Excel (.xlsx) files are supported.`,
      );
    }
  }

  /**
   * Extract header row and data rows from a worksheet.
   * Headers are normalized to snake_case.
   */
  private extractSheetData(worksheet: ExcelJS.Worksheet): {
    headers: string[];
    dataRows: Array<{ rowNumber: number; rowData: (ExcelJS.CellValue | undefined)[] }>;
  } {
    const headers: string[] = [];
    const dataRows: Array<{ rowNumber: number; rowData: (ExcelJS.CellValue | undefined)[] }> = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        row.eachCell((cell, colNumber) => {
          const headerValue = cell.value?.toString()?.trim() || '';
          headers[colNumber - 1] = this.normalizeHeader(headerValue);
        });
      } else {
        const rowData: (ExcelJS.CellValue | undefined)[] = [];
        for (let col = 1; col <= headers.length; col++) {
          const cell = row.getCell(col);
          rowData[col - 1] = cell.value;
        }
        const hasData = rowData.some(
          (v) => v !== null && v !== undefined && v !== '',
        );
        if (hasData) {
          dataRows.push({ rowNumber, rowData });
        }
      }
    });

    return { headers, dataRows };
  }

  /**
   * Normalize a header string to snake_case field name.
   * e.g. "First Name" -> "first_name", "ID" -> "id"
   */
  private normalizeHeader(header: string): string {
    return header
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .replace(/[^a-zA-Z0-9_]/g, '')
      .toLowerCase();
  }

  /**
   * Validate a single data row against the entity mapping.
   * Returns an array of errors (empty if valid).
   */
  private validateRow(
    rowData: (ExcelJS.CellValue | undefined)[],
    headers: string[],
    mapping: SheetEntityMapping,
  ): Array<{ field: string; message: string }> {
    const errors: Array<{ field: string; message: string }> = [];

    for (const requiredField of mapping.requiredFields) {
      const colIndex = headers.indexOf(requiredField);
      if (colIndex === -1) {
        errors.push({ field: requiredField, message: `Required column "${requiredField}" not found in sheet headers` });
        continue;
      }
      const value = rowData[colIndex];
      if (value === null || value === undefined || value === '') {
        errors.push({ field: requiredField, message: `Required field "${requiredField}" is empty` });
      }
    }

    for (let i = 0; i < headers.length; i++) {
      const fieldName = headers[i];
      if (!fieldName) continue;

      const colDef = mapping.columns[fieldName];
      if (!colDef) continue;

      if (mapping.skipFields.includes(fieldName)) continue;

      const value = rowData[i];
      if (value === null || value === undefined || value === '') {
        continue;
      }

      const strValue = this.cellValueToString(value);

      switch (colDef.type) {
        case 'uuid':
          if (!UUID_REGEX.test(strValue)) {
            errors.push({ field: fieldName, message: `Invalid UUID format: "${strValue}"` });
          }
          break;
        case 'number':
        case 'decimal':
        case 'integer':
          if (isNaN(Number(strValue))) {
            errors.push({ field: fieldName, message: `Expected a number, got: "${strValue}"` });
          }
          break;
        case 'boolean':
          if (!['true', 'false', '1', '0', 'yes', 'no'].includes(strValue.toLowerCase())) {
            errors.push({ field: fieldName, message: `Expected a boolean, got: "${strValue}"` });
          }
          break;
        case 'enum':
          if (colDef.enumValues && !colDef.enumValues.includes(strValue)) {
            errors.push({
              field: fieldName,
              message: `Invalid enum value "${strValue}". Allowed: ${colDef.enumValues.join(', ')}`,
            });
          }
          break;
        case 'date':
        case 'timestamp':
          if (!(value instanceof Date) && isNaN(Date.parse(strValue))) {
            errors.push({ field: fieldName, message: `Invalid date value: "${strValue}"` });
          }
          break;
      }
    }

    return errors;
  }

  /**
   * Convert a raw data row into a plain object suitable for TypeORM save/upsert.
   * Handles type coercion, field remapping, and FK-to-relation conversion.
   */
  private convertRow(
    rowData: (ExcelJS.CellValue | undefined)[],
    headers: string[],
    mapping: SheetEntityMapping,
  ): Record<string, any> | null {
    const obj: Record<string, any> = {};
    let hasId = false;

    for (let i = 0; i < headers.length; i++) {
      const headerName = headers[i];
      if (!headerName) continue;

      if (mapping.skipFields.includes(headerName)) continue;

      const colDef = mapping.columns[headerName];
      const value = rowData[i];

      // Apply field remap if defined (e.g. snake_case -> camelCase)
      const propertyName = mapping.fieldRemap[headerName] || headerName;

      if (value === null || value === undefined || value === '') {
        if (colDef && colDef.nullable) {
          obj[propertyName] = null;
        }
        continue;
      }

      if (headerName === 'id') hasId = true;

      if (!colDef) {
        obj[propertyName] = this.cellValueToString(value);
        continue;
      }

      obj[propertyName] = this.convertValue(value, colDef);
    }

    if (!hasId && !obj['id']) return null;

    // Transform FK columns into relation objects for TypeORM:
    // e.g. { customer_id: 'uuid' } -> { customer: { id: 'uuid' } }
    const relationKeys = Object.keys(mapping.relationMappings);
    for (const fkHeader of relationKeys) {
      const relationProp = mapping.relationMappings[fkHeader];
      // Determine the key that was actually set on obj (might be remapped)
      const resolvedKey = mapping.fieldRemap[fkHeader] || fkHeader;

      if (resolvedKey in obj) {
        const fkValue = obj[resolvedKey];
        if (fkValue !== null && fkValue !== undefined) {
          obj[relationProp] = { id: fkValue };
        } else {
          obj[relationProp] = null;
        }
        delete obj[resolvedKey];
      }
    }

    return obj;
  }

  /**
   * Convert a cell value according to its column definition.
   */
  private convertValue(value: ExcelJS.CellValue, colDef: ColumnDef): any {
    const strValue = this.cellValueToString(value);

    switch (colDef.type) {
      case 'uuid':
      case 'string':
      case 'time':
        return strValue;

      case 'number':
      case 'decimal': {
        const num = Number(strValue);
        return isNaN(num) ? null : num;
      }

      case 'integer': {
        const int = parseInt(strValue, 10);
        return isNaN(int) ? null : int;
      }

      case 'boolean': {
        const lower = strValue.toLowerCase();
        return lower === 'true' || lower === '1' || lower === 'yes';
      }

      case 'date':
      case 'timestamp': {
        if (value instanceof Date) return value;
        const parsed = new Date(strValue);
        return isNaN(parsed.getTime()) ? null : parsed;
      }

      case 'enum':
        return strValue;

      default:
        return strValue;
    }
  }

  /**
   * Convert any ExcelJS cell value to a trimmed string.
   */
  private cellValueToString(value: ExcelJS.CellValue): string {
    if (value === null || value === undefined) return '';
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'object') {
      if ('text' in value) return String((value as any).text).trim();
      if ('result' in value) return String((value as any).result).trim();
      if ('richText' in value) {
        return (value as any).richText.map((rt: any) => rt.text).join('').trim();
      }
      return JSON.stringify(value);
    }
    return String(value).trim();
  }

  /**
   * Import the Item-Categories junction table rows via raw SQL INSERT.
   */
  private async importJunctionTable(
    queryRunner: QueryRunner,
    rows: Record<string, any>[],
    dto: ImportDataDto,
    errors: Array<{ entity: string; row: number; message: string }>,
  ): Promise<{ imported: number; skipped: number }> {
    let imported = 0;
    let skipped = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const itemId = row['item_id'];
      const categoryId = row['category_id'];

      if (!itemId || !categoryId) {
        skipped++;
        errors.push({
          entity: 'Item-Categories',
          row: i + 2,
          message: 'Missing item_id or category_id',
        });
        continue;
      }

      try {
        if (dto.mode === ImportMode.UPSERT) {
          await queryRunner.query(
            `INSERT INTO item_categories (item_id, category_id) VALUES ($1, $2) ON CONFLICT (item_id, category_id) DO NOTHING`,
            [itemId, categoryId],
          );
        } else {
          await queryRunner.query(
            `INSERT INTO item_categories (item_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [itemId, categoryId],
          );
        }
        imported++;
      } catch (err: any) {
        if (dto.skip_errors) {
          skipped++;
          errors.push({
            entity: 'Item-Categories',
            row: i + 2,
            message: err?.message || 'Unknown error',
          });
        } else {
          throw err;
        }
      }
    }

    return { imported, skipped };
  }

  /**
   * Get the TypeORM repository for a given entity name.
   */
  private getRepository(entityName: string): Repository<any> | null {
    const repoMap: Record<string, Repository<any>> = {
      Category: this.categoryRepo,
      ExpenseCategory: this.expenseCategoryRepo,
      Table: this.tableRepo,
      KitchenItems: this.kitchenItemRepo,
      User: this.userRepo,
      Customer: this.customerRepo,
      Discount: this.discountRepo,
      Item: this.itemRepo,
      Bank: this.bankRepo,
      KitchenStock: this.kitchenStockRepo,
      Order: this.orderRepo,
      OrderItem: this.orderItemRepo,
      OrderToken: this.orderTokenRepo,
      Salary: this.salaryRepo,
      StuffAttendance: this.attendanceRepo,
      Leave: this.leaveRepo,
      Expenses: this.expensesRepo,
      KitchenOrder: this.kitchenOrderRepo,
      KitchenOrderItem: this.kitchenOrderItemRepo,
      DailyReport: this.dailyReportRepo,
    };
    return repoMap[entityName] || null;
  }

  // ---------------------------------------------------------------------------
  // SHEET MAPPING DEFINITIONS
  // ---------------------------------------------------------------------------

  /**
   * Build the complete mapping of sheet names to entity definitions,
   * including all column types, validation rules, field remapping,
   * and FK-to-relation mappings.
   */
  private buildSheetMappings(): Record<string, SheetEntityMapping> {
    // Shorthand for empty objects used by most entities
    const noRemap: Record<string, string> = {};
    const noRelations: Record<string, string> = {};
    const noSkip: string[] = [];

    return {
      'Categories': {
        entityName: 'Category',
        tableName: 'categories',
        requiredFields: ['id', 'name', 'name_bn', 'slug'],
        skipFields: noSkip,
        fieldRemap: noRemap,
        relationMappings: noRelations,
        columns: {
          id: { type: 'uuid' },
          name: { type: 'string' },
          name_bn: { type: 'string' },
          slug: { type: 'string' },
          description: { type: 'string', nullable: true },
          icon: { type: 'string', nullable: true },
          created_at: { type: 'timestamp', nullable: true },
          updated_at: { type: 'timestamp', nullable: true },
        },
      },

      'Expense Categories': {
        entityName: 'ExpenseCategory',
        tableName: 'expense_categories',
        requiredFields: ['id', 'name', 'slug'],
        skipFields: noSkip,
        fieldRemap: noRemap,
        relationMappings: noRelations,
        columns: {
          id: { type: 'uuid' },
          name: { type: 'string' },
          slug: { type: 'string' },
          description: { type: 'string', nullable: true },
          icon: { type: 'string', nullable: true },
          created_at: { type: 'timestamp', nullable: true },
          updated_at: { type: 'timestamp', nullable: true },
        },
      },

      'Tables': {
        entityName: 'Table',
        tableName: 'tables',
        requiredFields: ['id', 'number', 'seat'],
        skipFields: noSkip,
        fieldRemap: noRemap,
        relationMappings: noRelations,
        columns: {
          id: { type: 'uuid' },
          number: { type: 'string' },
          seat: { type: 'integer' },
          description: { type: 'string', nullable: true },
          location: { type: 'string', nullable: true },
          status: {
            type: 'enum',
            enumValues: Object.values(TableStatus),
            nullable: true,
          },
          created_at: { type: 'timestamp', nullable: true },
          updated_at: { type: 'timestamp', nullable: true },
        },
      },

      'Kitchen Items': {
        entityName: 'KitchenItems',
        tableName: 'kitchen_items',
        requiredFields: ['id', 'name', 'name_bn', 'slug'],
        skipFields: noSkip,
        fieldRemap: noRemap,
        relationMappings: noRelations,
        columns: {
          id: { type: 'uuid' },
          name: { type: 'string' },
          name_bn: { type: 'string' },
          slug: { type: 'string' },
          image: { type: 'string', nullable: true },
          description: { type: 'string', nullable: true },
          type: {
            type: 'enum',
            enumValues: Object.values(KitchenItemType),
            nullable: true,
          },
          created_at: { type: 'timestamp', nullable: true },
          updated_at: { type: 'timestamp', nullable: true },
        },
      },

      'Users': {
        entityName: 'User',
        tableName: 'users',
        requiredFields: ['id', 'first_name', 'last_name', 'phone'],
        skipFields: ['password'],
        fieldRemap: noRemap,
        relationMappings: noRelations,
        columns: {
          id: { type: 'uuid' },
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          email: { type: 'string', nullable: true },
          phone: { type: 'string' },
          nid_number: { type: 'string', nullable: true },
          nid_front_picture: { type: 'string', nullable: true },
          nid_back_picture: { type: 'string', nullable: true },
          address: { type: 'string', nullable: true },
          date_joined: { type: 'date', nullable: true },
          password: { type: 'string', nullable: true },
          status: {
            type: 'enum',
            enumValues: Object.values(UserStatus),
            nullable: true,
          },
          role: {
            type: 'enum',
            enumValues: Object.values(UserRole),
            nullable: true,
          },
          picture: { type: 'string', nullable: true },
          base_salary: { type: 'decimal', nullable: true },
          created_at: { type: 'timestamp', nullable: true },
          updated_at: { type: 'timestamp', nullable: true },
        },
      },

      'Customers': {
        entityName: 'Customer',
        tableName: 'customers',
        requiredFields: ['id', 'name', 'phone'],
        skipFields: ['password', 'refresh_token', 'otp', 'otp_expires_at'],
        fieldRemap: noRemap,
        relationMappings: noRelations,
        columns: {
          id: { type: 'uuid' },
          name: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string', nullable: true },
          address: { type: 'string', nullable: true },
          note: { type: 'string', nullable: true },
          picture: { type: 'string', nullable: true },
          password: { type: 'string', nullable: true },
          refresh_token: { type: 'string', nullable: true },
          is_verified: { type: 'boolean', nullable: true },
          otp: { type: 'string', nullable: true },
          otp_expires_at: { type: 'timestamp', nullable: true },
          points: { type: 'decimal', nullable: true },
          balance: { type: 'decimal', nullable: true },
          is_active: { type: 'boolean', nullable: true },
          created_at: { type: 'timestamp', nullable: true },
          updated_at: { type: 'timestamp', nullable: true },
        },
      },

      'Discounts': {
        entityName: 'Discount',
        tableName: 'discount',
        requiredFields: ['id', 'name', 'discount_type', 'discount_value', 'expiry_date'],
        skipFields: noSkip,
        fieldRemap: noRemap,
        relationMappings: noRelations,
        columns: {
          id: { type: 'uuid' },
          name: { type: 'string' },
          discount_type: {
            type: 'enum',
            enumValues: Object.values(DiscountType),
          },
          discount_value: { type: 'decimal' },
          expiry_date: { type: 'date' },
          created_at: { type: 'timestamp', nullable: true },
          updated_at: { type: 'timestamp', nullable: true },
        },
      },

      'Items': {
        entityName: 'Item',
        tableName: 'items',
        requiredFields: ['id', 'name', 'name_bn', 'slug', 'description', 'regular_price', 'image'],
        skipFields: noSkip,
        fieldRemap: noRemap,
        relationMappings: noRelations,
        columns: {
          id: { type: 'uuid' },
          name: { type: 'string' },
          name_bn: { type: 'string' },
          slug: { type: 'string' },
          description: { type: 'string' },
          type: {
            type: 'enum',
            enumValues: Object.values(ItemType),
            nullable: true,
          },
          status: {
            type: 'enum',
            enumValues: Object.values(ItemStatus),
            nullable: true,
          },
          regular_price: { type: 'decimal' },
          sale_price: { type: 'decimal', nullable: true },
          image: { type: 'string' },
          created_at: { type: 'timestamp', nullable: true },
          updated_at: { type: 'timestamp', nullable: true },
        },
      },

      'Item-Categories': {
        entityName: 'ItemCategory',
        tableName: 'item_categories',
        requiredFields: ['item_id', 'category_id'],
        skipFields: noSkip,
        fieldRemap: noRemap,
        relationMappings: noRelations,
        columns: {
          item_id: { type: 'uuid' },
          category_id: { type: 'uuid' },
        },
      },

      'Banks': {
        entityName: 'Bank',
        tableName: 'banks',
        requiredFields: ['id', 'bank_name', 'branch_name', 'account_number', 'routing_number'],
        skipFields: noSkip,
        fieldRemap: noRemap,
        relationMappings: { user_id: 'user' },
        columns: {
          id: { type: 'uuid' },
          bank_name: { type: 'string' },
          branch_name: { type: 'string' },
          account_number: { type: 'string' },
          routing_number: { type: 'string' },
          user_id: { type: 'uuid', nullable: true },
          created_at: { type: 'timestamp', nullable: true },
          updated_at: { type: 'timestamp', nullable: true },
        },
      },

      'Kitchen Stock': {
        entityName: 'KitchenStock',
        tableName: 'kitchen_stock',
        requiredFields: ['id', 'quantity', 'price', 'total_price'],
        skipFields: noSkip,
        fieldRemap: noRemap,
        relationMappings: { kitchen_item_id: 'kitchen_item' },
        columns: {
          id: { type: 'uuid' },
          kitchen_item_id: { type: 'uuid', nullable: true },
          quantity: { type: 'integer' },
          price: { type: 'decimal' },
          total_price: { type: 'decimal' },
          description: { type: 'string', nullable: true },
          created_at: { type: 'timestamp', nullable: true },
          updated_at: { type: 'timestamp', nullable: true },
        },
      },

      'Orders': {
        entityName: 'Order',
        tableName: 'orders',
        requiredFields: ['id'],
        skipFields: noSkip,
        fieldRemap: noRemap,
        relationMappings: {
          customer_id: 'customer',
          user_id: 'user',
          discount_id: 'discount',
        },
        columns: {
          id: { type: 'uuid' },
          order_id: { type: 'string', nullable: true },
          order_type: {
            type: 'enum',
            enumValues: Object.values(OrderType),
            nullable: true,
          },
          customer_id: { type: 'uuid', nullable: true },
          user_id: { type: 'uuid', nullable: true },
          status: {
            type: 'enum',
            enumValues: Object.values(OrderStatus),
            nullable: true,
          },
          sub_total: { type: 'decimal', nullable: true },
          total_amount: { type: 'decimal', nullable: true },
          discount_id: { type: 'uuid', nullable: true },
          discount_amount: { type: 'decimal', nullable: true },
          completion_time: { type: 'number', nullable: true },
          payment_method: {
            type: 'enum',
            enumValues: Object.values(PaymentMethod),
            nullable: true,
          },
          order_source: { type: 'string', nullable: true },
          delivery_address: { type: 'string', nullable: true },
          special_instructions: { type: 'string', nullable: true },
          customer_phone: { type: 'string', nullable: true },
          created_at: { type: 'timestamp', nullable: true },
          updated_at: { type: 'timestamp', nullable: true },
        },
      },

      'Order Items': {
        entityName: 'OrderItem',
        tableName: 'order_items',
        requiredFields: ['id', 'quantity', 'unit_price', 'total_price'],
        skipFields: noSkip,
        fieldRemap: noRemap,
        relationMappings: {
          order_id: 'order',
          item_id: 'item',
        },
        columns: {
          id: { type: 'uuid' },
          quantity: { type: 'integer' },
          unit_price: { type: 'decimal' },
          total_price: { type: 'decimal' },
          order_id: { type: 'uuid', nullable: true },
          item_id: { type: 'uuid', nullable: true },
          created_at: { type: 'timestamp', nullable: true },
          updated_at: { type: 'timestamp', nullable: true },
        },
      },

      'Order Tokens': {
        entityName: 'OrderToken',
        tableName: 'order_tokens',
        requiredFields: ['id', 'token', 'token_type'],
        skipFields: noSkip,
        // OrderToken entity uses camelCase for timestamps and auto-generated FK
        fieldRemap: {
          ready_at: 'readyAt',
          created_at: 'createdAt',
          updated_at: 'updatedAt',
        },
        // The ManyToOne order relation has no @JoinColumn, so TypeORM uses "orderId"
        relationMappings: { order_id: 'order' },
        columns: {
          id: { type: 'uuid' },
          token: { type: 'string' },
          token_type: {
            type: 'enum',
            enumValues: Object.values(TokenType),
          },
          order_id: { type: 'uuid', nullable: true },
          priority: {
            type: 'enum',
            enumValues: Object.values(OrderTokenPriority),
            nullable: true,
          },
          status: {
            type: 'enum',
            enumValues: Object.values(OrderTokenStatus),
            nullable: true,
          },
          ready_at: { type: 'timestamp', nullable: true },
          created_at: { type: 'timestamp', nullable: true },
          updated_at: { type: 'timestamp', nullable: true },
        },
      },

      'Salary': {
        entityName: 'Salary',
        tableName: 'salary',
        requiredFields: ['id', 'month', 'base_salary', 'total_payble'],
        skipFields: noSkip,
        fieldRemap: noRemap,
        relationMappings: { user_id: 'user' },
        columns: {
          id: { type: 'uuid' },
          user_id: { type: 'uuid', nullable: true },
          month: { type: 'date' },
          base_salary: { type: 'decimal' },
          bonus: { type: 'decimal', nullable: true },
          deductions: { type: 'decimal', nullable: true },
          total_payble: { type: 'decimal' },
          receipt_image: { type: 'string', nullable: true },
          is_paid: { type: 'boolean', nullable: true },
          notes: { type: 'string', nullable: true },
          created_at: { type: 'timestamp', nullable: true },
          updated_at: { type: 'timestamp', nullable: true },
        },
      },

      'Attendance': {
        entityName: 'StuffAttendance',
        tableName: 'stuff_attendance',
        requiredFields: ['id', 'attendance_date'],
        skipFields: noSkip,
        fieldRemap: noRemap,
        relationMappings: { user_id: 'user' },
        columns: {
          id: { type: 'uuid' },
          user_id: { type: 'uuid', nullable: true },
          attendance_date: { type: 'date' },
          check_in: { type: 'time', nullable: true },
          check_out: { type: 'time', nullable: true },
          status: {
            type: 'enum',
            enumValues: Object.values(AttendanceStatus),
            nullable: true,
          },
          work_hours: { type: 'decimal', nullable: true },
          overtime_hours: { type: 'decimal', nullable: true },
          notes: { type: 'string', nullable: true },
          approved_by: { type: 'uuid', nullable: true },
          is_approved: { type: 'boolean', nullable: true },
          created_at: { type: 'timestamp', nullable: true },
          updated_at: { type: 'timestamp', nullable: true },
        },
      },

      'Leave': {
        entityName: 'Leave',
        tableName: 'leave',
        requiredFields: ['id', 'user_id', 'leave_type', 'leave_start_date', 'leave_end_date', 'reason'],
        skipFields: noSkip,
        fieldRemap: noRemap,
        // Leave entity has an explicit user_id @Column, so no relation mapping needed
        relationMappings: noRelations,
        columns: {
          id: { type: 'uuid' },
          user_id: { type: 'uuid' },
          leave_type: { type: 'string' },
          leave_start_date: { type: 'date' },
          leave_end_date: { type: 'date' },
          reason: { type: 'string' },
          status: {
            type: 'enum',
            enumValues: Object.values(LeaveStatus),
            nullable: true,
          },
        },
      },

      'Kitchen Orders': {
        entityName: 'KitchenOrder',
        tableName: 'kitchen_orders',
        requiredFields: ['id'],
        skipFields: noSkip,
        fieldRemap: noRemap,
        relationMappings: { user_id: 'user' },
        columns: {
          id: { type: 'uuid' },
          order_id: { type: 'string', nullable: true },
          user_id: { type: 'uuid', nullable: true },
          total_amount: { type: 'decimal', nullable: true },
          is_approved: { type: 'boolean', nullable: true },
          description: { type: 'string', nullable: true },
          created_at: { type: 'timestamp', nullable: true },
          updated_at: { type: 'timestamp', nullable: true },
        },
      },

      'Kitchen Order Items': {
        entityName: 'KitchenOrderItem',
        tableName: 'kitchen_order_items',
        requiredFields: ['id', 'quantity', 'unit_price', 'total_price'],
        skipFields: noSkip,
        fieldRemap: noRemap,
        relationMappings: {
          kitchen_order_id: 'kitchen_order',
          kitchen_stock_id: 'kitchen_stock',
        },
        columns: {
          id: { type: 'uuid' },
          kitchen_order_id: { type: 'uuid', nullable: true },
          kitchen_stock_id: { type: 'uuid', nullable: true },
          quantity: { type: 'decimal' },
          unit_price: { type: 'decimal' },
          total_price: { type: 'decimal' },
          created_at: { type: 'timestamp', nullable: true },
          updated_at: { type: 'timestamp', nullable: true },
        },
      },

      'Expenses': {
        entityName: 'Expenses',
        tableName: 'expenses',
        requiredFields: ['id', 'title', 'amount'],
        skipFields: noSkip,
        fieldRemap: noRemap,
        relationMappings: { category_id: 'category' },
        columns: {
          id: { type: 'uuid' },
          title: { type: 'string' },
          amount: { type: 'decimal' },
          category_id: { type: 'uuid', nullable: true },
          description: { type: 'string', nullable: true },
          status: {
            type: 'enum',
            enumValues: Object.values(ExpenseStatus),
            nullable: true,
          },
          receipt_reference: { type: 'string', nullable: true },
          created_at: { type: 'timestamp', nullable: true },
          updated_at: { type: 'timestamp', nullable: true },
        },
      },

      'Daily Reports': {
        entityName: 'DailyReport',
        tableName: 'daily_reports',
        requiredFields: ['id', 'report_date'],
        skipFields: noSkip,
        fieldRemap: noRemap,
        relationMappings: noRelations,
        columns: {
          id: { type: 'uuid' },
          report_date: { type: 'date' },
          total_sales: { type: 'decimal', nullable: true },
          bar_sales: { type: 'decimal', nullable: true },
          kitchen_sales: { type: 'decimal', nullable: true },
          total_orders: { type: 'integer', nullable: true },
          bar_orders: { type: 'integer', nullable: true },
          kitchen_orders: { type: 'integer', nullable: true },
          total_expenses: { type: 'decimal', nullable: true },
          total_expense_items: { type: 'integer', nullable: true },
          credit_amount: { type: 'decimal', nullable: true },
          is_auto_generated: { type: 'boolean', nullable: true },
          generated_at: { type: 'timestamp', nullable: true },
          created_at: { type: 'timestamp', nullable: true },
          updated_at: { type: 'timestamp', nullable: true },
        },
      },
    };
  }
}
