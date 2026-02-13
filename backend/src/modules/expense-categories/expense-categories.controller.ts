import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpStatus, ParseUUIDPipe, BadRequestException, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ExpenseCategoriesService } from './providers/expense-categories.service';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto';
import { ExpenseCategoryResponseDto } from './dto/expense-category-response.dto';
import { iconStorage } from 'src/common/utils/storage.util';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enum/user-role.enum';

@ApiTags('Expense Categories')
@Controller('expense-categories')
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class ExpenseCategoriesController {
  constructor(private readonly expenseCategoriesService: ExpenseCategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new expense category' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Expense category created successfully', type: ExpenseCategoryResponseDto })
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'icon', maxCount: 1 }
  ], { storage: iconStorage }))
  async create(
    @Body() createDto: CreateExpenseCategoryDto,
    @UploadedFiles() files: { 
      icon?: Express.Multer.File[]
    }
  ): Promise<{ data: ExpenseCategoryResponseDto; status: string; message: string; statusCode: HttpStatus }> {
    if (files?.icon?.[0]?.path) {
      createDto.icon = files.icon[0].path.replace(/\\/g, '/');
    }
    const response = await this.expenseCategoriesService.create(createDto);
    return {
      data: response,
      status: 'success',
      message: 'Expense category has been created successfully.',
      statusCode: HttpStatus.CREATED
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all expense categories with optional filtering' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name or description' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  @ApiResponse({ status: 200, description: 'Returns a paginated list of expense categories', type: [ExpenseCategoryResponseDto] })
  async findAll(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ): Promise<{
    data: ExpenseCategoryResponseDto[];
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
    
    const result = await this.expenseCategoriesService.findAll({
      search,
      page: pageNumber,
      limit: limitNumber
    });
    
    return {
      ...result,
      status: 'success',
      message: 'Expense categories retrieved successfully',
      statusCode: HttpStatus.OK
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get expense category by ID' })
  @ApiParam({ name: 'id', description: 'Expense category ID' })
  @ApiResponse({ status: 200, description: 'Returns the expense category', type: ExpenseCategoryResponseDto })
  @ApiResponse({ status: 404, description: 'Expense category not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<{
    data: ExpenseCategoryResponseDto;
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    const category = await this.expenseCategoriesService.findOne(id);
    return {
      data: category,
      status: 'success',
      message: 'Expense category retrieved successfully',
      statusCode: HttpStatus.OK
    };
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get expense category by slug' })
  @ApiParam({ name: 'slug', description: 'Expense category slug' })
  @ApiResponse({ status: 200, description: 'Returns the expense category', type: ExpenseCategoryResponseDto })
  @ApiResponse({ status: 404, description: 'Expense category not found' })
  async findBySlug(@Param('slug') slug: string): Promise<{
    data: ExpenseCategoryResponseDto;
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    const category = await this.expenseCategoriesService.findBySlug(slug);
    return {
      data: category,
      status: 'success',
      message: 'Expense category retrieved successfully',
      statusCode: HttpStatus.OK
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an expense category' })
  @ApiParam({ name: 'id', description: 'Expense category ID' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Expense category updated successfully', type: ExpenseCategoryResponseDto })
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'icon', maxCount: 1 }
  ], { storage: iconStorage }))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateExpenseCategoryDto,
    @UploadedFiles() files: { 
      icon?: Express.Multer.File[]
    }
  ): Promise<{
    data: ExpenseCategoryResponseDto;
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    if (files?.icon?.[0]?.path) {
      updateDto.icon = files.icon[0].path.replace(/\\/g, '/');
    }
    
    const response = await this.expenseCategoriesService.update(id, updateDto);
    return {
      data: response,
      status: 'success',
      message: 'Expense category has been updated successfully.',
      statusCode: HttpStatus.OK
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an expense category' })
  @ApiParam({ name: 'id', description: 'Expense category ID' })
  @ApiResponse({ status: 200, description: 'Expense category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Expense category not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    await this.expenseCategoriesService.remove(id);
    return {
      status: 'success',
      message: 'Expense category deleted successfully',
      statusCode: HttpStatus.OK
    };
  }
}