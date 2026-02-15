/**
 * Apply soft-delete functionality to all backend modules.
 * Run: node apply-soft-delete.js
 */
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, 'src', 'modules');

// ============================================================
// Module definitions
// ============================================================
const modules = [
  // categories and items already done manually - skip
  {
    name: 'customers',
    servicePath: 'customers/providers/customer.service.ts',
    controllerPath: 'customers/customer.controller.ts',
    repo: 'customerRepository',
    alias: 'customer',
    searchField: 'name',
    svcName: 'customerService',
    removePattern: 'delete', // uses .delete(id)
  },
  {
    name: 'orders',
    servicePath: 'orders/providers/order.service.ts',
    controllerPath: 'orders/order.controller.ts',
    repo: 'orderRepository',
    alias: 'order',
    searchField: 'order_number',
    svcName: 'orderService',
    removePattern: 'auto',
  },
  {
    name: 'banks',
    servicePath: 'banks/providers/bank.service.ts',
    controllerPath: 'banks/bank.controller.ts',
    repo: 'bankRepository',
    alias: 'bank',
    searchField: 'bank_name',
    svcName: 'bankService',
    removePattern: 'auto',
  },
  {
    name: 'blog',
    servicePath: 'blog/blog.service.ts',
    controllerPath: 'blog/blog.controller.ts',
    repo: 'blogPostRepository',
    alias: 'post',
    searchField: 'title',
    svcName: 'blogService',
    removePattern: 'auto',
  },
  {
    name: 'expenses',
    servicePath: 'expenses/providers/expenses.service.ts',
    controllerPath: 'expenses/expenses.controller.ts',
    repo: 'expenseRepository',
    alias: 'expense',
    searchField: 'title',
    svcName: 'expensesService',
    removePattern: 'auto',
  },
  {
    name: 'expense-categories',
    servicePath: 'expense-categories/providers/expense-categories.service.ts',
    controllerPath: 'expense-categories/expense-categories.controller.ts',
    repo: 'expenseCategoryRepository',
    alias: 'expenseCategory',
    searchField: 'name',
    svcName: 'expenseCategoriesService',
    removePattern: 'auto',
  },
  {
    name: 'kitchen-items',
    servicePath: 'kitchen-items/providers/kitchen-item.service.ts',
    controllerPath: 'kitchen-items/kitchen-item.controller.ts',
    repo: 'kitchenItemRepository',
    alias: 'kitchenItem',
    searchField: 'name',
    svcName: 'kitchenItemService',
    removePattern: 'auto',
  },
  {
    name: 'kitchen-stock',
    servicePath: 'kitchen-stock/providers/kitchen-stock.service.ts',
    controllerPath: 'kitchen-stock/kitchen-stock.controller.ts',
    repo: 'kitchenStockRepository',
    alias: 'kitchenStock',
    searchField: 'supplier',
    svcName: 'kitchenStockService',
    removePattern: 'auto',
  },
  {
    name: 'kitchen-orders',
    servicePath: 'kitchen-orders/providers/kitchen-order.service.ts',
    controllerPath: 'kitchen-orders/kitchen-order.controller.ts',
    repo: 'kitchenOrderRepository',
    alias: 'kitchenOrder',
    searchField: 'notes',
    svcName: 'kitchenOrderService',
    removePattern: 'auto',
  },
  {
    name: 'discount',
    servicePath: 'discount/providers/discount.service.ts',
    controllerPath: 'discount/discount.controller.ts',
    repo: 'discountRepository',
    alias: 'discount',
    searchField: 'name',
    svcName: 'discountService',
    removePattern: 'auto',
  },
  {
    name: 'table',
    servicePath: 'table/providers/table.service.ts',
    controllerPath: 'table/table.controller.ts',
    repo: 'tableRepository',
    alias: 'table',
    searchField: 'name',
    svcName: 'tableService',
    removePattern: 'auto',
  },
  {
    name: 'partners',
    servicePath: 'partners/partners.service.ts',
    controllerPath: 'partners/partners.controller.ts',
    repo: 'partnerRepository',
    alias: 'partner',
    searchField: 'name',
    svcName: 'partnersService',
    removePattern: 'auto',
  },
  {
    name: 'reservations',
    servicePath: 'reservations/reservations.service.ts',
    controllerPath: 'reservations/reservations.controller.ts',
    repo: 'reservationRepository',
    alias: 'reservation',
    searchField: 'guest_name',
    svcName: 'reservationsService',
    removePattern: 'auto',
  },
  {
    name: 'contact-messages',
    servicePath: 'contact-messages/contact-messages.service.ts',
    controllerPath: 'contact-messages/contact-messages.controller.ts',
    repo: 'contactMessageRepository',
    alias: 'contactMessage',
    searchField: 'name',
    svcName: 'contactMessagesService',
    removePattern: 'auto',
  },
  {
    name: 'order-tokens',
    servicePath: 'order-tokens/provider/order-tokens.service.ts',
    controllerPath: 'order-tokens/order-tokens.controller.ts',
    repo: 'orderTokenRepository',
    alias: 'orderToken',
    searchField: 'token',
    svcName: 'orderTokensService',
    removePattern: 'auto',
  },
  {
    name: 'order-items',
    servicePath: 'order-items/providers/order-item.service.ts',
    controllerPath: 'order-items/order-item.controller.ts',
    repo: 'orderItemRepository',
    alias: 'orderItem',
    searchField: null,
    svcName: 'orderItemService',
    removePattern: 'auto',
  },
  {
    name: 'staff-salary',
    servicePath: 'staff-salary/providers/salary.service.ts',
    controllerPath: 'staff-salary/salary.controller.ts',
    repo: 'salaryRepository',
    alias: 'salary',
    searchField: null,
    svcName: 'salaryService',
    removePattern: 'auto',
  },
  {
    name: 'stuff-attendance',
    servicePath: 'stuff-attendance/providers/stuff-attendance.service.ts',
    controllerPath: 'stuff-attendance/stuff-attendance.controller.ts',
    repo: 'stuffAttendanceRepository',
    alias: 'attendance',
    searchField: null,
    svcName: 'stuffAttendanceService',
    removePattern: 'auto',
  },
  {
    name: 'stuff-leave',
    servicePath: 'stuff-leave/providers/leave.service.ts',
    controllerPath: 'stuff-leave/leave.controller.ts',
    repo: 'leaveRepository',
    alias: 'leave',
    searchField: 'leave_type',
    svcName: 'leaveService',
    removePattern: 'auto',
  },
  {
    name: 'users',
    servicePath: 'users/providers/user.service.ts',
    controllerPath: 'users/user.controller.ts',
    repo: 'userRepository',
    alias: 'user',
    searchField: 'first_name',
    svcName: 'userService',
    removePattern: 'none', // no existing remove method
  },
];

function genServiceMethods(m) {
  const searchBlock = m.searchField
    ? `
        if (search) {
            query.andWhere('LOWER(${m.alias}.${m.searchField}) LIKE :search', { search: \`%\${search.toLowerCase()}%\` });
        }
`
    : '';

  return `
    async bulkSoftDelete(ids: string[]): Promise<void> {
        await this.${m.repo}.softDelete(ids);
    }

    async findTrashed(options: { page: number, limit: number, search?: string }) {
        const { page, limit, search } = options;
        const query = this.${m.repo}.createQueryBuilder('${m.alias}')
            .withDeleted()
            .where('${m.alias}.deleted_at IS NOT NULL');
${searchBlock}
        query.orderBy('${m.alias}.deleted_at', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        const [data, total] = await query.getManyAndCount();
        return { data, total };
    }

    async restore(id: string): Promise<void> {
        await this.${m.repo}.restore(id);
    }

    async permanentDelete(id: string): Promise<void> {
        const entity = await this.${m.repo}.findOne({ where: { id }, withDeleted: true });
        if (!entity) {
            throw new NotFoundException(\`Record with ID \${id} not found\`);
        }
        if (!entity.deleted_at) {
            throw new NotFoundException(\`Record with ID \${id} is not in trash\`);
        }
        await this.${m.repo}.delete(id);
    }
`;
}

function genControllerBulkTrash(svcName) {
  return `
    @Delete('bulk/delete')
    @ApiOperation({ summary: 'Bulk soft delete' })
    async bulkSoftDelete(@Body() body: { ids: string[] }): Promise<any> {
        await this.${svcName}.bulkSoftDelete(body.ids);
        return {
            status: 'success',
            message: \`\${body.ids.length} record(s) moved to trash.\`,
            statusCode: HttpStatus.OK
        };
    }

    @Get('trash/list')
    @ApiOperation({ summary: 'List trashed records' })
    async findTrashed(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
    ): Promise<any> {
        const pageNumber = page ? Math.max(1, parseInt(page, 10)) : 1;
        const limitNumber = limit ? parseInt(limit, 10) : 10;
        const { data, total } = await this.${svcName}.findTrashed({ page: pageNumber, limit: limitNumber, search });
        return {
            data,
            total,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(total / limitNumber),
            status: 'success',
            message: 'Trashed records retrieved successfully.',
            statusCode: HttpStatus.OK
        };
    }
`;
}

function genControllerRestorePermanent(svcName) {
  return `
    @Patch(':id/restore')
    @ApiOperation({ summary: 'Restore from trash' })
    async restore(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
        await this.${svcName}.restore(id);
        return {
            status: 'success',
            message: 'Record restored successfully.',
            statusCode: HttpStatus.OK
        };
    }

    @Delete(':id/permanent')
    @ApiOperation({ summary: 'Permanently delete' })
    async permanentDelete(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
        await this.${svcName}.permanentDelete(id);
        return {
            status: 'success',
            message: 'Record permanently deleted.',
            statusCode: HttpStatus.OK
        };
    }
`;
}

// ============================================================
// PROCESS
// ============================================================
let totalProcessed = 0;
let errors = [];

for (const m of modules) {
  try {
    const svcPath = path.join(BASE, m.servicePath);
    const ctrlPath = path.join(BASE, m.controllerPath);

    if (!fs.existsSync(svcPath)) {
      errors.push(`${m.name}: Service file not found: ${svcPath}`);
      continue;
    }
    if (!fs.existsSync(ctrlPath)) {
      errors.push(`${m.name}: Controller file not found: ${ctrlPath}`);
      continue;
    }

    // ---- SERVICE ----
    let svc = fs.readFileSync(svcPath, 'utf8');

    // Replace remove method's delete/remove call with softDelete
    if (m.removePattern !== 'none') {
      // Pattern 1: await this.xxxRepository.delete(id)
      const deleteRegex = new RegExp(
        `(async remove\\([^)]*\\)[^{]*\\{[\\s\\S]*?)await this\\.${m.repo}\\.delete\\(id\\)`,
      );
      if (deleteRegex.test(svc)) {
        svc = svc.replace(deleteRegex, `$1await this.${m.repo}.softDelete(id)`);
      }

      // Pattern 2: await this.xxxRepository.remove(someVar)
      const removeRegex = new RegExp(
        `(async remove\\([^)]*\\)[^}]*?)await this\\.${m.repo}\\.remove\\(\\w+\\)`,
      );
      if (removeRegex.test(svc)) {
        svc = svc.replace(removeRegex, `$1await this.${m.repo}.softDelete(id)`);
      }
    }

    // Add new methods - insert before the last closing brace
    const newMethods = genServiceMethods(m);

    // For users, also add a remove method since it doesn't have one
    let extraRemove = '';
    if (m.removePattern === 'none') {
      extraRemove = `
    async remove(id: string): Promise<void> {
        await this.${m.repo}.softDelete(id);
    }
`;
    }

    // Ensure NotFoundException is imported
    if (!svc.includes('NotFoundException')) {
      if (svc.includes("from '@nestjs/common'")) {
        svc = svc.replace(
          /import \{([^}]+)\} from '@nestjs\/common'/,
          (match, imports) => `import {${imports}, NotFoundException} from '@nestjs/common'`
        );
      }
    }

    // Insert before last }
    const lastBrace = svc.lastIndexOf('}');
    svc = svc.slice(0, lastBrace) + extraRemove + newMethods + '}\n';

    fs.writeFileSync(svcPath, svc, 'utf8');

    // ---- CONTROLLER ----
    let ctrl = fs.readFileSync(ctrlPath, 'utf8');

    // Ensure required imports
    const requiredImports = ['Delete', 'Get', 'Patch', 'Query', 'Param', 'Body', 'ParseUUIDPipe', 'HttpStatus'];
    for (const imp of requiredImports) {
      if (!ctrl.includes(imp)) {
        ctrl = ctrl.replace(
          /import \{([^}]+)\} from ['"]@nestjs\/common['"]/,
          (match, imports) => match.replace(imports, imports + ', ' + imp)
        );
      }
    }

    if (!ctrl.includes('ApiOperation')) {
      ctrl = ctrl.replace(
        /import \{([^}]+)\} from ['"]@nestjs\/swagger['"]/,
        (match, imports) => match.replace(imports, imports + ', ApiOperation')
      );
    }

    // Insert bulk/trash routes BEFORE the first @Get()
    const bulkTrashCode = genControllerBulkTrash(m.svcName);

    // Find first @Get() or @Get('') - these are list endpoints
    const getMatch = ctrl.match(/(\n\s+@Get\(\)\s*\n)/);
    if (getMatch) {
      const pos = ctrl.indexOf(getMatch[0]);
      ctrl = ctrl.slice(0, pos) + '\n' + bulkTrashCode + ctrl.slice(pos);
    } else {
      // Find first @Get(':id') as fallback
      const getIdMatch = ctrl.match(/(\n\s+@Get\(':id'\)\s*\n)/);
      if (getIdMatch) {
        const pos = ctrl.indexOf(getIdMatch[0]);
        ctrl = ctrl.slice(0, pos) + '\n' + bulkTrashCode + ctrl.slice(pos);
      } else {
        // Last resort: insert after constructor
        const constructorEnd = ctrl.indexOf('{}', ctrl.indexOf('constructor'));
        if (constructorEnd > -1) {
          const nextNewline = ctrl.indexOf('\n', constructorEnd);
          ctrl = ctrl.slice(0, nextNewline + 1) + '\n' + bulkTrashCode + ctrl.slice(nextNewline + 1);
        }
      }
    }

    // Insert restore/permanent at the end (before last })
    const restorePermanent = genControllerRestorePermanent(m.svcName);
    const lastBrace2 = ctrl.lastIndexOf('}');
    ctrl = ctrl.slice(0, lastBrace2) + restorePermanent + '}\n';

    fs.writeFileSync(ctrlPath, ctrl, 'utf8');

    totalProcessed++;
    console.log(`[OK] ${m.name}`);
  } catch (err) {
    errors.push(`${m.name}: ${err.message}`);
    console.error(`[ERROR] ${m.name}: ${err.message}`);
  }
}

console.log(`\nProcessed: ${totalProcessed}/${modules.length}`);
if (errors.length > 0) {
  console.log('\nErrors:');
  errors.forEach(e => console.log(`  - ${e}`));
}
console.log('\nDone!');
