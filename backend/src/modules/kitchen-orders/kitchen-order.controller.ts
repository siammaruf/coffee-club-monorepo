import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Put, 
  Delete, 
  HttpCode, 
  HttpStatus, 
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  Patch,
  ParseUUIDPipe
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { KitchenOrderService } from './providers/kitchen-order.service';
import { CreateKitchenOrderDto } from './dto/kitchen-order-create.dto';
import { UpdateKitchenOrderDto } from './dto/kitchen-order-update.dto';
import { KitchenOrderResponseDto } from './dto/kitchen-order-response.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enum/user-role.enum';
import { ApiErrorResponses } from '../../common/decorators/api-error-responses.decorator';

@ApiTags('Kitchen Orders')
@ApiBearerAuth('staff-auth')
@ApiErrorResponses()
@Controller('kitchen-orders')
@Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF)
export class KitchenOrderController {
  constructor(private readonly kitchenOrderService: KitchenOrderService) {}

    @Delete('bulk/delete')
    @ApiOperation({ summary: 'Bulk soft delete' })
    async bulkSoftDelete(@Body() body: { ids: string[] }): Promise<any> {
        await this.kitchenOrderService.bulkSoftDelete(body.ids);
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
        const { data, total } = await this.kitchenOrderService.findTrashed({ page: pageNumber, limit: limitNumber, search });
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
  @ApiOperation({ summary: 'Get all kitchen orders with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'kitchenStockId', required: false, type: String, description: 'Filter by kitchen stock ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Kitchen orders retrieved successfully',
    example: {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
      status: 'success',
      message: 'Kitchen orders retrieved successfully',
      statusCode: 200
    }
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('kitchenStockId') kitchenStockId?: string,
  ) {
    const { data, total } = await this.kitchenOrderService.findAll(page, limit, kitchenStockId);
    const totalPages = Math.ceil(total / limit);
    
    return {
      data,
      total,
      page,
      limit,
      totalPages,
      status: 'success',
      message: 'Kitchen orders retrieved successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get kitchen order by ID' })
  @ApiParam({ name: 'id', description: 'Kitchen order ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Kitchen order retrieved successfully',
    example: {
      data: {},
      status: 'success',
      message: 'Kitchen order retrieved successfully',
      statusCode: 200
    }
  })
  @ApiResponse({ status: 404, description: 'Kitchen order not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.kitchenOrderService.findOne(id);
    return {
      data,
      status: 'success',
      message: 'Kitchen order retrieved successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @Get('stock/:stockId')
  @ApiOperation({ summary: 'Get kitchen orders by stock ID' })
  @ApiParam({ name: 'stockId', description: 'Kitchen stock ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Kitchen orders retrieved successfully',
    example: {
      data: [],
      status: 'success',
      message: 'Kitchen orders retrieved successfully',
      statusCode: 200
    }
  })
  async findByStockId(@Param('stockId', ParseUUIDPipe) stockId: string) {
    const data = await this.kitchenOrderService.findByStockId(stockId);
    return {
      data,
      status: 'success',
      message: 'Kitchen orders retrieved successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new kitchen order' })
  @ApiResponse({ 
    status: 201, 
    description: 'Kitchen order created successfully',
    example: {
      data: {},
      status: 'success',
      message: 'Kitchen order created successfully',
      statusCode: 201
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createKitchenOrderDto: CreateKitchenOrderDto) {
    const data = await this.kitchenOrderService.create(createKitchenOrderDto);
    return {
      data,
      status: 'success',
      message: 'Kitchen order created successfully',
      statusCode: HttpStatus.CREATED,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update kitchen order by ID' })
  @ApiParam({ name: 'id', description: 'Kitchen order ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Kitchen order updated successfully',
    example: {
      data: {},
      status: 'success',
      message: 'Kitchen order updated successfully',
      statusCode: 200
    }
  })
  @ApiResponse({ status: 404, description: 'Kitchen order not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateKitchenOrderDto: UpdateKitchenOrderDto,
  ) {
    const data = await this.kitchenOrderService.update(id, updateKitchenOrderDto);
    return {
      data,
      status: 'success',
      message: 'Kitchen order updated successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete kitchen order by ID' })
  @ApiParam({ name: 'id', description: 'Kitchen order ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Kitchen order deleted successfully',
    example: {
      status: 'success',
      message: 'Kitchen order deleted successfully',
      statusCode: 200
    }
  })
  @ApiResponse({ status: 404, description: 'Kitchen order not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.kitchenOrderService.remove(id);
    return {
      status: 'success',
      message: 'Kitchen order deleted successfully',
      statusCode: HttpStatus.OK,
    };
  }

  @Patch('approve/:id')
  @ApiOperation({ summary: 'Approve kitchen order and reduce stock' })
  @ApiParam({ name: 'id', description: 'Kitchen order ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Kitchen order approved successfully and stock reduced',
    example: {
      data: {},
      status: 'success',
      message: 'Kitchen order approved successfully',
      statusCode: 200
    }
  })
  @ApiResponse({ status: 404, description: 'Kitchen order not found' })
  @ApiResponse({ status: 400, description: 'Order already approved or insufficient stock' })
  @HttpCode(HttpStatus.OK)
  async approve(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const data = await this.kitchenOrderService.approve(id);
      return {
        data,
        status: 'success',
        message: 'Kitchen order approved successfully',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw error;
    }
  }

    @Patch(':id/restore')
    @ApiOperation({ summary: 'Restore from trash' })
    async restore(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
        await this.kitchenOrderService.restore(id);
        return {
            status: 'success',
            message: 'Record restored successfully.',
            statusCode: HttpStatus.OK
        };
    }

    @Delete(':id/permanent')
    @ApiOperation({ summary: 'Permanently delete' })
    async permanentDelete(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
        await this.kitchenOrderService.permanentDelete(id);
        return {
            status: 'success',
            message: 'Record permanently deleted.',
            statusCode: HttpStatus.OK
        };
    }
}
