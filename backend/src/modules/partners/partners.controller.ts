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
  HttpCode,
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
import { UserRole } from '../users/enum/user-role.enum';
import { PartnersService } from './partners.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { ApiErrorResponses } from '../../common/decorators/api-error-responses.decorator';

@ApiTags('Partners')
@ApiBearerAuth('staff-auth')
@ApiErrorResponses()
@Roles(UserRole.ADMIN, UserRole.MANAGER)
@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Post()
  @ApiOperation({ summary: 'Create partner', description: 'Creates a new partner' })
  @ApiResponse({ status: 201, description: 'Partner created successfully' })
  async create(@Body() dto: CreatePartnerDto) {
    const partner = await this.partnersService.create(dto);
    return {
      data: partner,
      status: 'success',
      message: 'Partner created successfully.',
      statusCode: HttpStatus.CREATED,
    };
  }

    @Delete('bulk/delete')
    @ApiOperation({ summary: 'Bulk soft delete' })
    async bulkSoftDelete(@Body() body: { ids: string[] }): Promise<any> {
        await this.partnersService.bulkSoftDelete(body.ids);
        return {
            status: 'success',
            message: `${body.ids.length} record(s) moved to trash.`,
            statusCode: HttpStatus.OK
        };
    }

    @Patch('bulk/restore')
    @ApiOperation({ summary: 'Bulk restore from trash' })
    async bulkRestore(@Body() body: { ids: string[] }): Promise<any> {
        await this.partnersService.bulkRestore(body.ids);
        return {
            status: 'success',
            message: `${body.ids.length} record(s) restored.`,
            statusCode: HttpStatus.OK,
        };
    }

    @Delete('bulk/permanent')
    @ApiOperation({ summary: 'Bulk permanent delete' })
    async bulkPermanentDelete(@Body() body: { ids: string[] }): Promise<any> {
        const result = await this.partnersService.bulkPermanentDelete(body.ids);
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
    @ApiOperation({ summary: 'List trashed records' })
    async findTrashed(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
    ): Promise<any> {
        const pageNumber = page ? Math.max(1, parseInt(page, 10)) : 1;
        const limitNumber = limit ? parseInt(limit, 10) : 10;
        const { data, total } = await this.partnersService.findTrashed({ page: pageNumber, limit: limitNumber, search });
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
  @ApiOperation({ summary: 'List all partners', description: 'Retrieves a paginated list of all partners' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name' })
  @ApiResponse({ status: 200, description: 'Partners retrieved successfully' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNumber = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;

    const result = await this.partnersService.findAll({
      page: pageNumber,
      limit: limitNumber,
      search,
    });

    const totalPages = Math.ceil(result.total / limitNumber);

    return {
      data: result.data,
      total: result.total,
      page: pageNumber,
      limit: limitNumber,
      totalPages,
      status: 'success',
      message: 'Partners retrieved successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get partner by ID', description: 'Retrieves a single partner by ID' })
  @ApiParam({ name: 'id', description: 'Partner ID' })
  @ApiResponse({ status: 200, description: 'Partner retrieved successfully' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const partner = await this.partnersService.findOne(id);
    return {
      data: partner,
      status: 'success',
      message: 'Partner retrieved successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update partner', description: 'Updates an existing partner' })
  @ApiParam({ name: 'id', description: 'Partner ID' })
  @ApiResponse({ status: 200, description: 'Partner updated successfully' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePartnerDto,
  ) {
    const partner = await this.partnersService.update(id, dto);
    return {
      data: partner,
      status: 'success',
      message: 'Partner updated successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete partner', description: 'Deletes a partner by ID' })
  @ApiParam({ name: 'id', description: 'Partner ID' })
  @ApiResponse({ status: 200, description: 'Partner deleted successfully' })
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.partnersService.remove(id);
    return {
      status: 'success',
      message: 'Partner deleted successfully.',
      statusCode: HttpStatus.OK,
    };
  }

    @Patch(':id/restore')
    @ApiOperation({ summary: 'Restore from trash' })
    async restore(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
        await this.partnersService.restore(id);
        return {
            status: 'success',
            message: 'Record restored successfully.',
            statusCode: HttpStatus.OK
        };
    }

    @Delete(':id/permanent')
    @ApiOperation({ summary: 'Permanently delete' })
    async permanentDelete(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
        await this.partnersService.permanentDelete(id);
        return {
            status: 'success',
            message: 'Record permanently deleted.',
            statusCode: HttpStatus.OK
        };
    }
}
