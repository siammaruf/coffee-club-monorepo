import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe , HttpStatus} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { OrderItemService } from './providers/order-item.service';
import { CreateOrderItemDto } from './dto/order-item-create.dto';
import { UpdateOrderItemDto } from './dto/order-item-update.dto';
import { OrderItemResponseDto } from './dto/order-item-response.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enum/user-role.enum';
import { ApiErrorResponses } from '../../common/decorators/api-error-responses.decorator';

@ApiTags('OrderItems')
@ApiBearerAuth('staff-auth')
@ApiErrorResponses()
@Controller('order-items')
@Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STUFF, UserRole.BARISTA)
export class OrderItemController {
  constructor(private readonly orderItemService: OrderItemService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order item' })
  @ApiResponse({ status: 201, description: 'The order item has been successfully created.', type: OrderItemResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  create(@Body() createOrderItemDto: CreateOrderItemDto): Promise<OrderItemResponseDto> {
    return this.orderItemService.create(createOrderItemDto);
  }

    @Delete('bulk/delete')
    @ApiOperation({ summary: 'Bulk soft delete' })
    async bulkSoftDelete(@Body() body: { ids: string[] }): Promise<any> {
        await this.orderItemService.bulkSoftDelete(body.ids);
        return {
            status: 'success',
            message: `${body.ids.length} record(s) moved to trash.`,
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
        const { data, total } = await this.orderItemService.findTrashed({ page: pageNumber, limit: limitNumber, search });
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


  @Get()
  @ApiOperation({ summary: 'Get all order items or filter by order ID' })
  @ApiQuery({ name: 'orderId', required: false, description: 'Filter items by order ID' })
  @ApiResponse({ status: 200, description: 'Return all order items or filtered by order ID.', type: [OrderItemResponseDto] })
  findAll(@Query('orderId') orderId?: string): Promise<OrderItemResponseDto[]> {
    if (orderId) {
      return this.orderItemService.findByOrderId(orderId);
    }
    return this.orderItemService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific order item by ID' })
  @ApiParam({ name: 'id', description: 'Order item ID' })
  @ApiResponse({ status: 200, description: 'Return the order item.', type: OrderItemResponseDto })
  @ApiResponse({ status: 404, description: 'Order item not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<OrderItemResponseDto> {
    return this.orderItemService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an order item' })
  @ApiParam({ name: 'id', description: 'Order item ID' })
  @ApiResponse({ status: 200, description: 'The order item has been successfully updated.', type: OrderItemResponseDto })
  @ApiResponse({ status: 404, description: 'Order item not found.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderItemDto: UpdateOrderItemDto,
  ): Promise<OrderItemResponseDto> {
    return this.orderItemService.update(id, updateOrderItemDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an order item' })
  @ApiParam({ name: 'id', description: 'Order item ID' })
  @ApiResponse({ status: 200, description: 'The order item has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Order item not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.orderItemService.remove(id);
  }

    @Patch(':id/restore')
    @ApiOperation({ summary: 'Restore from trash' })
    async restore(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
        await this.orderItemService.restore(id);
        return {
            status: 'success',
            message: 'Record restored successfully.',
            statusCode: HttpStatus.OK
        };
    }

    @Delete(':id/permanent')
    @ApiOperation({ summary: 'Permanently delete' })
    async permanentDelete(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
        await this.orderItemService.permanentDelete(id);
        return {
            status: 'success',
            message: 'Record permanently deleted.',
            statusCode: HttpStatus.OK
        };
    }
}
