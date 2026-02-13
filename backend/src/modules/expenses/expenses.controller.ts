import { Controller, Get, Post, Body, Param, Put, Delete, HttpCode, HttpStatus, Query, ParseUUIDPipe, BadRequestException, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ExpensesService } from './providers/expenses.service';
import { CreateExpensesDto } from './dto/create-expenses.dto';
import { UpdateExpensesDto } from './dto/update-expenses.dto';
import { ExpensesResponseDto } from './dto/expenses-response.dto';
import { ExpenseStatus } from './enum/expense-status.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enum/user-role.enum';

@ApiTags('Expenses')
@Controller('expenses')
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all expenses with optional filtering' })
  @ApiQuery({ name: 'categoryId', required: false, type: String, description: 'Filter by category ID' })
  @ApiQuery({ name: 'status', required: false, enum: ExpenseStatus, enumName: 'ExpenseStatus', description: 'Filter by status' })
  @ApiQuery({ name: 'dateFilter', required: false, enum: ['today', 'week', 'month', 'all'], description: 'Filter by date range' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'Returns a paginated list of expenses', type: [ExpensesResponseDto] })
  async findAll(
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: ExpenseStatus,
    @Query('dateFilter') dateFilter?: 'today' | 'week' | 'month' | 'all',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{
    data: ExpensesResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    const pageNumber = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    
    if (page && isNaN(pageNumber)) {
      throw new BadRequestException('Page must be a number');
    }
    
    if (limit && isNaN(limitNumber)) {
      throw new BadRequestException('Limit must be a number');
    }
    
    const result = await this.expensesService.findAll({
      categoryId,
      status,
      dateFilter,
      page: pageNumber,
      limit: limitNumber
    });
    
    return {
      ...result,
      status: 'success',
      message: 'Expenses retrieved successfully',
      statusCode: HttpStatus.OK
    };
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get expense summary' })
  @ApiResponse({ status: 200, description: 'Returns expense summary' })
  async getSummary(): Promise<{
    data: any;
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    const summary = await this.expensesService.getSummary();
    return {
      data: summary,
      status: 'success',
      message: 'Expense summary retrieved successfully',
      statusCode: HttpStatus.OK
    };
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get expenses by status' })
  @ApiParam({ name: 'status', description: 'Expense status', enum: ExpenseStatus })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'Returns expenses for the status' })
  @ApiResponse({ status: 400, description: 'Invalid status' })
  async getExpensesByStatus(
    @Param('status') status: ExpenseStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ): Promise<{
    data: ExpensesResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    const pageNumber = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    
    if (page && isNaN(pageNumber)) {
      throw new BadRequestException('Page must be a number');
    }
    
    if (limit && isNaN(limitNumber)) {
      throw new BadRequestException('Limit must be a number');
    }

    const result = await this.expensesService.getExpensesByStatus(status, pageNumber, limitNumber);
    return {
      ...result,
      status: 'success',
      message: 'Expenses retrieved successfully',
      statusCode: HttpStatus.OK
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get expense by ID' })
  @ApiParam({ name: 'id', description: 'Expense ID' })
  @ApiResponse({ status: 200, description: 'Returns the expense' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<{
    data: ExpensesResponseDto;
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    const expense = await this.expensesService.findOne(id);
    return {
      data: expense,
      status: 'success',
      message: 'Expense retrieved successfully',
      statusCode: HttpStatus.OK
    };
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get expenses by category' })
  @ApiParam({ name: 'categoryId', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Returns expenses for the category' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findByCategory(@Param('categoryId', ParseUUIDPipe) categoryId: string): Promise<{
    data: ExpensesResponseDto[];
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    const expenses = await this.expensesService.findByCategory(categoryId);
    return {
      data: expenses,
      status: 'success',
      message: 'Expenses retrieved successfully',
      statusCode: HttpStatus.OK
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new expense' })
  @ApiBody({ type: CreateExpensesDto })
  @ApiResponse({ status: 201, description: 'Expense created successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createExpensesDto: CreateExpensesDto): Promise<{
    data: ExpensesResponseDto;
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    const expense = await this.expensesService.create(createExpensesDto);
    return {
      data: expense,
      status: 'success',
      message: 'Expense created successfully',
      statusCode: HttpStatus.CREATED
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an expense' })
  @ApiParam({ name: 'id', description: 'Expense ID' })
  @ApiBody({ type: UpdateExpensesDto })
  @ApiResponse({ status: 200, description: 'Expense updated successfully' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateExpensesDto: UpdateExpensesDto,
  ): Promise<{
    data: ExpensesResponseDto;
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    const expense = await this.expensesService.update(id, updateExpensesDto);
    return {
      data: expense,
      status: 'success',
      message: 'Expense updated successfully',
      statusCode: HttpStatus.OK
    };
  }

  @Patch('status/:id')
  @ApiOperation({ summary: 'Update expense status' })
  @ApiParam({ name: 'id', description: 'Expense ID' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        status: { 
          type: 'string', 
          enum: Object.values(ExpenseStatus),
          example: ExpenseStatus.APPROVED
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Expense status updated successfully' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: ExpenseStatus
  ): Promise<{
    data: ExpensesResponseDto;
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    if (!Object.values(ExpenseStatus).includes(status)) {
      throw new BadRequestException(`Invalid status. Valid values are: ${Object.values(ExpenseStatus).join(', ')}`);
    }
    
    const expense = await this.expensesService.updateStatus(id, status);
    return {
      data: expense,
      status: 'success',
      message: `Expense status updated to ${status} successfully`,
      statusCode: HttpStatus.OK
    };
  }

  @Patch('bulk/status')
  @ApiOperation({ summary: 'Update status for multiple expenses' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        ids: { 
          type: 'array',
          items: { type: 'string' },
          example: ['uuid1', 'uuid2']
        },
        status: { 
          type: 'string', 
          enum: Object.values(ExpenseStatus),
          example: ExpenseStatus.APPROVED
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Expense statuses updated successfully' })
  @ApiResponse({ status: 404, description: 'One or more expenses not found' })
  async updateMultipleStatus(
    @Body('ids') ids: string[],
    @Body('status') status: ExpenseStatus
  ): Promise<{
    data: ExpensesResponseDto[];
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException('IDs array is required and cannot be empty');
    }

    if (!Object.values(ExpenseStatus).includes(status)) {
      throw new BadRequestException(`Invalid status. Valid values are: ${Object.values(ExpenseStatus).join(', ')}`);
    }
    
    const expenses = await this.expensesService.updateMultipleStatus(ids, status);
    return {
      data: expenses,
      status: 'success',
      message: `${expenses.length} expense(s) status updated to ${status} successfully`,
      statusCode: HttpStatus.OK
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an expense' })
  @ApiParam({ name: 'id', description: 'Expense ID' })
  @ApiResponse({ status: 200, description: 'Expense deleted successfully' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    await this.expensesService.remove(id);
    return {
      status: 'success',
      message: 'Expense deleted successfully',
      statusCode: HttpStatus.OK
    };
  }
}