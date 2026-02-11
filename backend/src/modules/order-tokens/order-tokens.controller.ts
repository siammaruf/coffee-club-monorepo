import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { OrderTokensService } from './provider/order-tokens.service';
import { CreateOrderTokenDto } from './dto/create-order-token.dto';
import { UpdateOrderTokenDto } from './dto/update-order-token.dto';
import { OrderTokenResponseDto } from './dto/order-token-response.dto';

@ApiTags('Order Tokens')
@Controller('order-tokens')
export class OrderTokensController {
  constructor(private readonly orderTokensService: OrderTokensService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order token' })
  @ApiBody({ type: CreateOrderTokenDto })
  @ApiResponse({ status: 201, description: 'Order token created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Order or order items not found' })
  async create(@Body() createOrderTokenDto: CreateOrderTokenDto) {
    const response = await this.orderTokensService.create(createOrderTokenDto);
    return {
      data: response,
      status: 'success',
      message: 'Order token has been created successfully.',
      statusCode: HttpStatus.CREATED
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all order tokens with pagination and search' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by token, status, or priority' })
  @ApiResponse({ status: 200, description: 'Order tokens retrieved successfully', type: [OrderTokenResponseDto] })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string
  ): Promise<{
    data: OrderTokenResponseDto[],
    total: number,
    page: number,
    limit: number,
    totalPages: number,
    status: string,
    message: string,
    statusCode: HttpStatus
  }> {
    const response = await this.orderTokensService.findAll(page, limit, search);
    return {
      data: response.data,
      total: response.total,
      page: response.page,
      limit: response.limit,
      totalPages: response.totalPages,
      status: 'success',
      message: 'Order tokens retrieved successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order token by ID' })
  @ApiParam({ name: 'id', description: 'Order token UUID' })
  @ApiResponse({ status: 200, description: 'Order token retrieved successfully', type: OrderTokenResponseDto })
  @ApiResponse({ status: 404, description: 'Order token not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const response = await this.orderTokensService.findOne(id);
    return {
      data: response,
      status: 'success',
      message: 'Order token retrieved successfully.',
      statusCode: HttpStatus.OK
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update order token' })
  @ApiParam({ name: 'id', description: 'Order token UUID' })
  @ApiBody({ type: UpdateOrderTokenDto })
  @ApiResponse({ status: 200, description: 'Order token updated successfully', type: OrderTokenResponseDto })
  @ApiResponse({ status: 404, description: 'Order token not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderTokenDto: UpdateOrderTokenDto,
  ) {
    const response = await this.orderTokensService.update(id, updateOrderTokenDto);
    return {
      data: response,
      status: 'success',
      message: 'Order token has been updated successfully.',
      statusCode: HttpStatus.OK
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete order token' })
  @ApiParam({ name: 'id', description: 'Order token UUID' })
  @ApiResponse({ status: 200, description: 'Order token deleted successfully' })
  @ApiResponse({ status: 404, description: 'Order token not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const response = await this.orderTokensService.remove(id);
    return {
      data: response,
      status: 'success',
      message: 'Order token has been deleted successfully.',
      statusCode: HttpStatus.OK
    };
  }
}