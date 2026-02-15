import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { OrderTokensService } from './provider/order-tokens.service';
import { CreateOrderTokenDto } from './dto/create-order-token.dto';
import { UpdateOrderTokenDto } from './dto/update-order-token.dto';
import { OrderTokenResponseDto } from './dto/order-token-response.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enum/user-role.enum';
import { ApiErrorResponses } from '../../common/decorators/api-error-responses.decorator';

@ApiTags('Order Tokens')
@ApiBearerAuth('staff-auth')
@ApiErrorResponses()
@Controller('order-tokens')
@Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STUFF, UserRole.BARISTA)
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

    @Delete('bulk/delete')
    @ApiOperation({ summary: 'Bulk soft delete' })
    async bulkSoftDelete(@Body() body: { ids: string[] }): Promise<any> {
        await this.orderTokensService.bulkSoftDelete(body.ids);
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
        const { data, total } = await this.orderTokensService.findTrashed({ page: pageNumber, limit: limitNumber, search });
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

    @Patch(':id/restore')
    @ApiOperation({ summary: 'Restore from trash' })
    async restore(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
        await this.orderTokensService.restore(id);
        return {
            status: 'success',
            message: 'Record restored successfully.',
            statusCode: HttpStatus.OK
        };
    }

    @Delete(':id/permanent')
    @ApiOperation({ summary: 'Permanently delete' })
    async permanentDelete(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
        await this.orderTokensService.permanentDelete(id);
        return {
            status: 'success',
            message: 'Record permanently deleted.',
            statusCode: HttpStatus.OK
        };
    }
}
