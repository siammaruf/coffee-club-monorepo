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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { UserRole } from '../users/enum/user-role.enum';
import { VendorsService } from './providers/vendors.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { ApiErrorResponses } from '../../common/decorators/api-error-responses.decorator';
import { VendorStatus } from './enum/vendor-status.enum';

@ApiTags('Vendors')
@ApiBearerAuth('staff-auth')
@ApiErrorResponses()
@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequirePermission('vendors.create')
  @ApiOperation({ summary: 'Create vendor', description: 'Creates a new vendor' })
  @ApiResponse({ status: 201, description: 'Vendor created successfully' })
  async create(@Body() dto: CreateVendorDto) {
    const vendor = await this.vendorsService.create(dto);
    return {
      data: vendor,
      status: 'success',
      message: 'Vendor created successfully.',
      statusCode: HttpStatus.CREATED,
    };
  }

  @Get('active')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF, UserRole.STUFF, UserRole.BARISTA)
  @ApiOperation({ summary: 'List active vendors' })
  async findActive() {
    const data = await this.vendorsService.findActive();
    return {
      data,
      status: 'success',
      message: 'Active vendors fetched.',
      statusCode: HttpStatus.OK,
    };
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF, UserRole.STUFF, UserRole.BARISTA)
  @ApiOperation({ summary: 'List all vendors', description: 'Retrieves a paginated list of all vendors' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name, contact person or mobile' })
  @ApiQuery({ name: 'status', enum: VendorStatus, required: false })
  @ApiQuery({ name: 'vendor_type', required: false })
  @ApiResponse({ status: 200, description: 'Vendors retrieved successfully' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: VendorStatus,
    @Query('vendor_type') vendor_type?: string,
  ) {
    const pageNumber = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;

    const result = await this.vendorsService.findAll({
      page: pageNumber,
      limit: limitNumber,
      search,
      status,
      vendor_type,
    });

    const totalPages = Math.ceil(result.total / limitNumber);

    return {
      data: result.data,
      total: result.total,
      page: pageNumber,
      limit: limitNumber,
      totalPages,
      status: 'success',
      message: 'Vendors retrieved successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF, UserRole.STUFF, UserRole.BARISTA)
  @ApiOperation({ summary: 'Get vendor by ID', description: 'Retrieves a single vendor by ID' })
  @ApiParam({ name: 'id', description: 'Vendor ID' })
  @ApiResponse({ status: 200, description: 'Vendor retrieved successfully' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const vendor = await this.vendorsService.findOne(id);
    return {
      data: vendor,
      status: 'success',
      message: 'Vendor retrieved successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequirePermission('vendors.edit')
  @ApiOperation({ summary: 'Update vendor', description: 'Updates an existing vendor' })
  @ApiParam({ name: 'id', description: 'Vendor ID' })
  @ApiResponse({ status: 200, description: 'Vendor updated successfully' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVendorDto,
  ) {
    const vendor = await this.vendorsService.update(id, dto);
    return {
      data: vendor,
      status: 'success',
      message: 'Vendor updated successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequirePermission('vendors.delete')
  @ApiOperation({ summary: 'Delete vendor', description: 'Deletes a vendor by ID' })
  @ApiParam({ name: 'id', description: 'Vendor ID' })
  @ApiResponse({ status: 200, description: 'Vendor deleted successfully' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.vendorsService.remove(id);
    return {
      status: 'success',
      message: 'Vendor deleted successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Delete('bulk/delete')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequirePermission('vendors.delete')
  @ApiOperation({ summary: 'Bulk soft delete' })
  async bulkSoftDelete(@Body() body: { ids: string[] }) {
    await this.vendorsService.bulkSoftDelete(body.ids);
    return {
      status: 'success',
      message: `${body.ids.length} record(s) moved to trash.`,
      statusCode: HttpStatus.OK,
    };
  }

  @Patch('bulk/restore')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequirePermission('vendors.edit')
  @ApiOperation({ summary: 'Bulk restore from trash' })
  async bulkRestore(@Body() body: { ids: string[] }) {
    await this.vendorsService.bulkRestore(body.ids);
    return {
      status: 'success',
      message: `${body.ids.length} record(s) restored.`,
      statusCode: HttpStatus.OK,
    };
  }

  @Delete('bulk/permanent')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequirePermission('vendors.delete')
  @ApiOperation({ summary: 'Bulk permanent delete' })
  async bulkPermanentDelete(@Body() body: { ids: string[] }) {
    const result = await this.vendorsService.bulkPermanentDelete(body.ids);
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
  @RequirePermission('vendors.view')
  @ApiOperation({ summary: 'List trashed records' })
  async findTrashed(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNumber = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    const { data, total } = await this.vendorsService.findTrashed({ page: pageNumber, limit: limitNumber, search });
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
  @RequirePermission('vendors.edit')
  @ApiOperation({ summary: 'Restore from trash' })
  async restore(@Param('id', ParseUUIDPipe) id: string) {
    await this.vendorsService.restore(id);
    return {
      status: 'success',
      message: 'Record restored successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Delete(':id/permanent')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @RequirePermission('vendors.delete')
  @ApiOperation({ summary: 'Permanently delete' })
  async permanentDelete(@Param('id', ParseUUIDPipe) id: string) {
    await this.vendorsService.permanentDelete(id);
    return {
      status: 'success',
      message: 'Record permanently deleted.',
      statusCode: HttpStatus.OK,
    };
  }
}
