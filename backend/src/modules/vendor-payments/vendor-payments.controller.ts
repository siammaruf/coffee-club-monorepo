import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  ParseUUIDPipe,
  Patch,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { UserRole } from '../users/enum/user-role.enum';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { VendorPaymentsService } from './providers/vendor-payments.service';
import { CreateVendorPaymentDto } from './dto/create-vendor-payment.dto';
import { UpdateVendorPaymentDto } from './dto/update-vendor-payment.dto';
import { ApiErrorResponses } from '../../common/decorators/api-error-responses.decorator';
import { VendorPaymentType } from './enum/vendor-payment-type.enum';

@ApiTags('Vendor Payments')
@ApiBearerAuth('staff-auth')
@ApiErrorResponses()
@Controller('vendor-payments')
export class VendorPaymentsController {
  constructor(private readonly vendorPaymentsService: VendorPaymentsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequirePermission('vendor_payments.create')
  @ApiOperation({ summary: 'Create vendor payment', description: 'Records a new vendor payment' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('screenshot', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  async create(
    @Body() dto: CreateVendorPaymentDto,
    @UploadedFile() file?: Express.Multer.File,
    @CurrentUser() user?: any,
  ) {
    const data = await this.vendorPaymentsService.create(dto, file, user?.id);
    return {
      data,
      status: 'success',
      message: 'Payment recorded successfully.',
      statusCode: HttpStatus.CREATED,
    };
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequirePermission('vendor_payments.view')
  @ApiOperation({ summary: 'List all vendor payments' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'vendor_id', required: false })
  @ApiQuery({ name: 'start_date', required: false })
  @ApiQuery({ name: 'end_date', required: false })
  @ApiQuery({ name: 'payment_type', enum: VendorPaymentType, required: false })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('vendor_id') vendor_id?: string,
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
    @Query('payment_type') payment_type?: VendorPaymentType,
  ) {
    const result = await this.vendorPaymentsService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      vendor_id,
      start_date,
      end_date,
      payment_type,
    });
    return {
      ...result,
      status: 'success',
      message: 'Payments fetched successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequirePermission('vendor_payments.view')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.vendorPaymentsService.findOne(id);
    return {
      data,
      status: 'success',
      message: 'Payment fetched successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequirePermission('vendor_payments.edit')
  @ApiOperation({ summary: 'Update vendor payment' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('screenshot', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiParam({ name: 'id', description: 'Payment ID' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVendorPaymentDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const data = await this.vendorPaymentsService.update(id, dto, file);
    return {
      data,
      status: 'success',
      message: 'Payment updated successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequirePermission('vendor_payments.delete')
  @ApiOperation({ summary: 'Delete vendor payment' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.vendorPaymentsService.softDelete(id);
    return {
      status: 'success',
      message: 'Payment deleted successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Delete('bulk/delete')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequirePermission('vendor_payments.delete')
  @ApiOperation({ summary: 'Bulk soft delete' })
  async bulkSoftDelete(@Body() body: { ids: string[] }) {
    await this.vendorPaymentsService.bulkSoftDelete(body.ids);
    return {
      status: 'success',
      message: `${body.ids.length} record(s) moved to trash.`,
      statusCode: HttpStatus.OK,
    };
  }

  @Patch('bulk/restore')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequirePermission('vendor_payments.edit')
  @ApiOperation({ summary: 'Bulk restore from trash' })
  async bulkRestore(@Body() body: { ids: string[] }) {
    await this.vendorPaymentsService.bulkRestore(body.ids);
    return {
      status: 'success',
      message: `${body.ids.length} record(s) restored.`,
      statusCode: HttpStatus.OK,
    };
  }

  @Delete('bulk/permanent')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequirePermission('vendor_payments.delete')
  @ApiOperation({ summary: 'Bulk permanent delete' })
  async bulkPermanentDelete(@Body() body: { ids: string[] }) {
    const result = await this.vendorPaymentsService.bulkPermanentDelete(body.ids);
    return {
      data: result,
      status: result.failed.length === 0 ? 'success' : 'partial',
      message: result.failed.length === 0
        ? `${result.deleted.length} record(s) permanently deleted.`
        : `${result.deleted.length} deleted, ${result.failed.length} failed.`,
      statusCode: HttpStatus.OK,
    };
  }

  @Get('trash/list')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequirePermission('vendor_payments.view')
  @ApiOperation({ summary: 'List trashed records' })
  async findTrashed(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNumber = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    const { data, total } = await this.vendorPaymentsService.findTrashed({ page: pageNumber, limit: limitNumber, search });
    return {
      data,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
      status: 'success',
      message: 'Trashed records retrieved successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Patch(':id/restore')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequirePermission('vendor_payments.edit')
  @ApiOperation({ summary: 'Restore from trash' })
  async restore(@Param('id', ParseUUIDPipe) id: string) {
    await this.vendorPaymentsService.restore(id);
    return {
      status: 'success',
      message: 'Record restored successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Delete(':id/permanent')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequirePermission('vendor_payments.delete')
  @ApiOperation({ summary: 'Permanently delete' })
  async permanentDelete(@Param('id', ParseUUIDPipe) id: string) {
    await this.vendorPaymentsService.permanentDelete(id);
    return {
      status: 'success',
      message: 'Record permanently deleted.',
      statusCode: HttpStatus.OK,
    };
  }
}
