import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { UserRole } from '../users/enum/user-role.enum';
import { ApiErrorResponses } from '../../common/decorators/api-error-responses.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { KitchenStockService } from './providers/kitchen-stock.service';
import { CreateKitchenStockDto } from './dto/create-kitchen-stock.dto';
import { UpdateKitchenStockDto } from './dto/update-kitchen-stock.dto';
import { KitchenItemType } from '../kitchen-items/enum/kitchen-item-type.enum';
import { KitchenStockEntryType } from './enum/kitchen-stock-entry-type.enum';

@ApiTags('Kitchen Stock')
@ApiBearerAuth('staff-auth')
@ApiErrorResponses()
@Controller('kitchen-stock')
export class KitchenStockController {
  constructor(private readonly kitchenStockService: KitchenStockService) {}

  @Get('summary')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF, UserRole.STUFF, UserRole.BARISTA)
  @ApiOperation({ summary: 'Get aggregated stock summary per item' })
  @ApiQuery({ name: 'type', enum: KitchenItemType, required: false })
  async getSummary(@Query('type') type?: KitchenItemType) {
    const data = await this.kitchenStockService.getStockSummary(type);
    return { data, status: 'success', message: 'Stock summary fetched.', statusCode: HttpStatus.OK };
  }

  @Get('low-stock-alerts')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF, UserRole.STUFF, UserRole.BARISTA)
  @ApiOperation({ summary: 'Get items below low stock threshold' })
  async getLowStockAlerts() {
    const data = await this.kitchenStockService.getLowStockAlerts();
    return { data, status: 'success', message: 'Low stock alerts fetched.', statusCode: HttpStatus.OK };
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF, UserRole.STUFF, UserRole.BARISTA)
  @ApiOperation({ summary: 'List all stock entries' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'type', enum: KitchenItemType, required: false })
  @ApiQuery({ name: 'kitchen_item_id', required: false })
  @ApiQuery({ name: 'start_date', required: false })
  @ApiQuery({ name: 'end_date', required: false })
  @ApiQuery({ name: 'entry_type', enum: KitchenStockEntryType, required: false })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: KitchenItemType,
    @Query('kitchen_item_id') kitchen_item_id?: string,
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
    @Query('entry_type') entry_type?: KitchenStockEntryType,
  ) {
    const result = await this.kitchenStockService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      type,
      kitchen_item_id,
      start_date,
      end_date,
      entry_type,
    });
    return { ...result, status: 'success', message: 'Stock entries fetched.', statusCode: HttpStatus.OK };
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF, UserRole.STUFF, UserRole.BARISTA)
  @ApiOperation({ summary: 'Get single stock entry' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.kitchenStockService.findOne(id);
    return { data, status: 'success', message: 'Stock entry fetched.', statusCode: HttpStatus.OK };
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF)
  @RequirePermission('kitchen_stock.create')
  @ApiOperation({ summary: 'Create a new stock entry (purchase or usage)' })
  async create(@Body() dto: CreateKitchenStockDto, @CurrentUser() user: any) {
    const data = await this.kitchenStockService.create(dto, user?.id);
    return { data, status: 'success', message: 'Stock entry created.', statusCode: HttpStatus.CREATED };
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF)
  @RequirePermission('kitchen_stock.edit')
  @ApiOperation({ summary: 'Update a stock entry' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateKitchenStockDto) {
    const data = await this.kitchenStockService.update(id, dto);
    return { data, status: 'success', message: 'Stock entry updated.', statusCode: HttpStatus.OK };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF)
  @RequirePermission('kitchen_stock.delete')
  @ApiOperation({ summary: 'Soft delete a stock entry' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.kitchenStockService.softDelete(id);
    return { status: 'success', message: 'Stock entry deleted.', statusCode: HttpStatus.OK };
  }
}
