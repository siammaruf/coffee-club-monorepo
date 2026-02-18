import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { CustomerOrdersService } from './providers/customer-orders.service';
import { CreateCustomerOrderDto } from './dto/create-customer-order.dto';
import { CustomerOrderResponseDto } from './dto/customer-order-response.dto';
import { CustomerJwtAuthGuard } from '../customer-auth/guards/customer-jwt-auth.guard';
import { CurrentCustomer } from '../../common/decorators/customer.decorator';
import { Customer } from '../customers/entities/customer.entity';
import { Public } from '../../common/decorators/public.decorator';
import { ApiErrorResponses } from '../../common/decorators/api-error-responses.decorator';

@ApiTags('Customer Orders')
@ApiBearerAuth('customer-auth')
@ApiErrorResponses()
@Public()
@Controller('customer/orders')
@UseGuards(CustomerJwtAuthGuard)
export class CustomerOrdersController {
  constructor(
    private readonly customerOrdersService: CustomerOrdersService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Place a new order',
    description: 'Creates a new order from the authenticated customer with items, calculates prices server-side',
  })
  @ApiResponse({
    status: 201,
    description: 'Order placed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data or unavailable items',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found - Customer or items not found',
  })
  async placeOrder(
    @CurrentCustomer() customer: Customer,
    @Body() dto: CreateCustomerOrderDto,
  ): Promise<{
    data: CustomerOrderResponseDto;
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    const order = await this.customerOrdersService.placeOrder(
      customer.id,
      dto,
    );
    return {
      data: new CustomerOrderResponseDto(order),
      status: 'success',
      message: 'Order placed successfully.',
      statusCode: HttpStatus.CREATED,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Get customer order history',
    description: 'Retrieves paginated list of orders for the authenticated customer',
  })
  @ApiQuery({
    name: 'page',
    type: 'number',
    required: false,
    description: 'Page number for pagination (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    required: false,
    description: 'Number of orders per page (default: 10)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully',
  })
  async getOrders(
    @CurrentCustomer() customer: Customer,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{
    data: CustomerOrderResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    const pageNumber = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNumber = limit ? Math.max(1, parseInt(limit, 10)) : 10;

    const result = await this.customerOrdersService.getOrders(
      customer.id,
      pageNumber,
      limitNumber,
    );
    return {
      data: result.data.map((order) => new CustomerOrderResponseDto(order)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      status: 'success',
      message: 'Orders retrieved successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get order details',
    description: 'Retrieves a specific order by ID for the authenticated customer',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Unique identifier of the order',
  })
  @ApiResponse({
    status: 200,
    description: 'Order retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Order does not belong to customer',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found - Order not found',
  })
  async getOrder(
    @CurrentCustomer() customer: Customer,
    @Param('id', ParseUUIDPipe) orderId: string,
  ): Promise<{
    data: CustomerOrderResponseDto;
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    const order = await this.customerOrdersService.getOrder(
      customer.id,
      orderId,
    );
    return {
      data: new CustomerOrderResponseDto(order),
      status: 'success',
      message: 'Order retrieved successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Put(':id/cancel')
  @ApiOperation({
    summary: 'Cancel a pending order',
    description: 'Cancels an order that is still in PENDING status. Only the order owner can cancel.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Unique identifier of the order to cancel',
  })
  @ApiResponse({
    status: 200,
    description: 'Order cancelled successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Order is not in PENDING status',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Order does not belong to customer',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found - Order not found',
  })
  async cancelOrder(
    @CurrentCustomer() customer: Customer,
    @Param('id', ParseUUIDPipe) orderId: string,
  ): Promise<{
    data: CustomerOrderResponseDto;
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    const order = await this.customerOrdersService.cancelOrder(
      customer.id,
      orderId,
    );
    return {
      data: new CustomerOrderResponseDto(order),
      status: 'success',
      message: 'Order cancelled successfully.',
      statusCode: HttpStatus.OK,
    };
  }
}
