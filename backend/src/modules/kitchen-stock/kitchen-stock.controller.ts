import { Controller, Get, Post, Body, Param, Put, Delete, HttpCode, HttpStatus, Patch, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { KitchenStockService } from './providers/kitchen-stock.service';
import { CreateKitchenStockDto } from './dto/kitchen-stock-create.dto';
import { UpdateKitchenStockDto } from './dto/kitchen-stock-update.dto';
import { KitchenStockResponseDto } from './dto/kitchen-stock-response.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enum/user-role.enum';
import { ApiErrorResponses } from '../../common/decorators/api-error-responses.decorator';

@ApiTags('Kitchen Stock')
@ApiBearerAuth('staff-auth')
@ApiErrorResponses()
@Controller('kitchen-stock')
@Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF)
export class KitchenStockController {
  constructor(private readonly kitchenStockService: KitchenStockService) {}

  @Get()
  @ApiOperation({ summary: 'Get all kitchen stock with pagination' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'itemId', required: false, description: 'Filter by kitchen item ID' })
  @ApiResponse({ status: 200, description: 'List of kitchen stock retrieved successfully' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('itemId') itemId?: string
  ): Promise<{
    data: KitchenStockResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    
    const { data: responseData, total } = await this.kitchenStockService.findAll(
      pageNumber,
      limitNumber,
      itemId
    );
    
    const totalPages = Math.ceil(total / limitNumber);
    
    return {
      data: responseData,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages,
      status: 'success',
      message: 'Kitchen stock retrieved successfully.',
      statusCode: HttpStatus.OK
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get kitchen stock by ID' })
  @ApiParam({ name: 'id', description: 'Kitchen stock ID' })
  @ApiResponse({ status: 200, description: 'Kitchen stock retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Kitchen stock not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.kitchenStockService.findOne(id);
    
    return {
      data,
      status: 'success',
      message: 'Kitchen stock retrieved successfully.',
      statusCode: HttpStatus.OK
    };
  }

  @Get('item/:itemId')
  @ApiOperation({ summary: 'Get kitchen stock by item ID' })
  @ApiParam({ name: 'itemId', description: 'Kitchen item ID' })
  @ApiResponse({ status: 200, description: 'Kitchen stock retrieved successfully' })
  async findByItemId(@Param('itemId', ParseUUIDPipe) itemId: string) {
    const data = await this.kitchenStockService.findByItemId(itemId);
    
    return {
      data,
      status: 'success',
      message: 'Kitchen stock retrieved successfully.',
      statusCode: HttpStatus.OK
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new kitchen stock' })
  @ApiResponse({ status: 201, description: 'Kitchen stock created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Kitchen item not found' })
  async create(@Body() createKitchenStockDto: CreateKitchenStockDto) {
    const data = await this.kitchenStockService.create(createKitchenStockDto);
    
    return {
      data,
      status: 'success',
      message: 'Kitchen stock created successfully.',
      statusCode: HttpStatus.CREATED
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update kitchen stock by ID' })
  @ApiParam({ name: 'id', description: 'Kitchen stock ID' })
  @ApiResponse({ status: 200, description: 'Kitchen stock updated successfully' })
  @ApiResponse({ status: 404, description: 'Kitchen stock not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateKitchenStockDto: UpdateKitchenStockDto,
  ) {
    const data = await this.kitchenStockService.update(id, updateKitchenStockDto);
    
    return {
      data,
      status: 'success',
      message: 'Kitchen stock updated successfully.',
      statusCode: HttpStatus.OK
    };
  }

  @Patch(':id/quantity')
  @ApiOperation({ summary: 'Update kitchen stock quantity' })
  @ApiParam({ name: 'id', description: 'Kitchen stock ID' })
  @ApiResponse({ status: 200, description: 'Kitchen stock quantity updated successfully' })
  @ApiResponse({ status: 404, description: 'Kitchen stock not found' })
  async updateQuantity(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('quantity') quantity: number,
  ) {
    const data = await this.kitchenStockService.updateQuantity(id, quantity);
    
    return {
      data,
      status: 'success',
      message: 'Kitchen stock quantity updated successfully.',
      statusCode: HttpStatus.OK
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete kitchen stock by ID' })
  @ApiParam({ name: 'id', description: 'Kitchen stock ID' })
  @ApiResponse({ status: 204, description: 'Kitchen stock deleted successfully' })
  @ApiResponse({ status: 404, description: 'Kitchen stock not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.kitchenStockService.remove(id);
    
    return {
      data: null,
      status: 'success',
      message: 'Kitchen stock deleted successfully.',
      statusCode: HttpStatus.NO_CONTENT
    };
  }
}