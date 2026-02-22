import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpStatus, ParseUUIDPipe, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { TableService } from './providers/table.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { TableResponseDto } from './dto/table-response.dto';
import { TableStatus } from './enum/table-status.enum';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enum/user-role.enum';
import { ApiErrorResponses } from '../../common/decorators/api-error-responses.decorator';

@ApiTags('Tables')
@ApiBearerAuth('staff-auth')
@ApiErrorResponses()
@Controller('tables')
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new table' })
  @ApiResponse({ status: 201, description: 'Table created successfully', type: TableResponseDto })
  async create(@Body() createTableDto: CreateTableDto): Promise<{
    data: TableResponseDto;
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    const table = await this.tableService.create(createTableDto);
    return {
      data: table,
      status: 'success',
      message: 'Table created successfully',
      statusCode: HttpStatus.CREATED
    };
  }

    @Delete('bulk/delete')
    @ApiOperation({ summary: 'Bulk soft delete' })
    async bulkSoftDelete(@Body() body: { ids: string[] }): Promise<any> {
        await this.tableService.bulkSoftDelete(body.ids);
        return {
            status: 'success',
            message: `${body.ids.length} record(s) moved to trash.`,
            statusCode: HttpStatus.OK
        };
    }

    @Patch('bulk/restore')
    @ApiOperation({ summary: 'Bulk restore from trash' })
    async bulkRestore(@Body() body: { ids: string[] }): Promise<any> {
        await this.tableService.bulkRestore(body.ids);
        return {
            status: 'success',
            message: `${body.ids.length} record(s) restored.`,
            statusCode: HttpStatus.OK,
        };
    }

    @Delete('bulk/permanent')
    @ApiOperation({ summary: 'Bulk permanent delete' })
    async bulkPermanentDelete(@Body() body: { ids: string[] }): Promise<any> {
        const result = await this.tableService.bulkPermanentDelete(body.ids);
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
        const { data, total } = await this.tableService.findTrashed({ page: pageNumber, limit: limitNumber, search });
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
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get all tables with optional filtering' })
  @ApiQuery({ name: 'status', required: false, enum: TableStatus, enumName: 'TableStatus', description: 'Filter by table status' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by table number or description' })
  @ApiQuery({ name: 'location', required: false, description: 'Filter by table location' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'Returns a paginated list of tables', type: [TableResponseDto] })
  async findAll(
    @Query('status') status?: TableStatus,
    @Query('search') search?: string,
    @Query('location') location?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ): Promise<{
    data: TableResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    const pageNumber = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    
    if (page && isNaN(pageNumber)) {
      throw new BadRequestException('Page must be a number');
    }
    
    if (limit && isNaN(limitNumber)) {
      throw new BadRequestException('Limit must be a number');
    }
    
    const result = await this.tableService.findAll({
      status,
      search,
      location,
      page: pageNumber,
      limit: limitNumber
    });
    
    return {
      ...result,
      status: 'success',
      message: 'Tables retrieved successfully',
      statusCode: HttpStatus.OK
    };
  }

  @Get('available')
  @ApiOperation({ summary: 'Get all available tables' })
  @ApiResponse({ status: 200, description: 'Returns all available tables', type: [TableResponseDto] })
  async getAvailableTables(): Promise<{
    data: TableResponseDto[];
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    const tables = await this.tableService.getAvailableTables();
    return {
      data: tables,
      status: 'success',
      message: 'Available tables retrieved successfully',
      statusCode: HttpStatus.OK
    };
  }

  @Get('location/:location')
  @ApiOperation({ summary: 'Get tables by location' })
  @ApiParam({ name: 'location', description: 'Table location' })
  @ApiResponse({ status: 200, description: 'Returns tables in the specified location', type: [TableResponseDto] })
  @ApiResponse({ status: 404, description: 'No tables found in this location' })
  async getTablesByLocation(@Param('location') location: string): Promise<{
    data: TableResponseDto[];
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    const tables = await this.tableService.getTablesByLocation(location);
    return {
      data: tables,
      status: 'success',
      message: `Tables in location '${location}' retrieved successfully`,
      statusCode: HttpStatus.OK
    };
  }

  @Get('number/:number')
  @ApiOperation({ summary: 'Get table by number' })
  @ApiParam({ name: 'number', description: 'Table number' })
  @ApiResponse({ status: 200, description: 'Returns the table', type: TableResponseDto })
  @ApiResponse({ status: 404, description: 'Table not found' })
  async findByNumber(@Param('number') number: string): Promise<{
    data: TableResponseDto;
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    const table = await this.tableService.findByNumber(number);
    return {
      data: table,
      status: 'success',
      message: 'Table retrieved successfully',
      statusCode: HttpStatus.OK
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get table by ID' })
  @ApiParam({ name: 'id', description: 'Table ID' })
  @ApiResponse({ status: 200, description: 'Returns the table', type: TableResponseDto })
  @ApiResponse({ status: 404, description: 'Table not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<{
    data: TableResponseDto;
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    const table = await this.tableService.findOne(id);
    return {
      data: table,
      status: 'success',
      message: 'Table retrieved successfully',
      statusCode: HttpStatus.OK
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a table' })
  @ApiParam({ name: 'id', description: 'Table ID' })
  @ApiResponse({ status: 200, description: 'Table updated successfully', type: TableResponseDto })
  @ApiResponse({ status: 404, description: 'Table not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTableDto: UpdateTableDto,
  ): Promise<{
    data: TableResponseDto;
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    const table = await this.tableService.update(id, updateTableDto);
    return {
      data: table,
      status: 'success',
      message: 'Table updated successfully',
      statusCode: HttpStatus.OK
    };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update table status' })
  @ApiParam({ name: 'id', description: 'Table ID' })
  @ApiResponse({ status: 200, description: 'Table status updated successfully', type: TableResponseDto })
  @ApiResponse({ status: 404, description: 'Table not found' })
  @ApiResponse({ status: 400, description: 'Invalid status' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: TableStatus
  ): Promise<{
    data: TableResponseDto;
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    if (!Object.values(TableStatus).includes(status)) {
      throw new BadRequestException(`Invalid status. Valid values are: ${Object.values(TableStatus).join(', ')}`);
    }
    
    const table = await this.tableService.updateStatus(id, status);
    return {
      data: table,
      status: 'success',
      message: `Table status updated to ${status} successfully`,
      statusCode: HttpStatus.OK
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a table' })
  @ApiParam({ name: 'id', description: 'Table ID' })
  @ApiResponse({ status: 200, description: 'Table deleted successfully' })
  @ApiResponse({ status: 404, description: 'Table not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{
    status: string;
    message: string;
    statusCode: HttpStatus;
  }> {
    await this.tableService.remove(id);
    return {
      status: 'success',
      message: 'Table deleted successfully',
      statusCode: HttpStatus.OK
    };
  }

    @Patch(':id/restore')
    @ApiOperation({ summary: 'Restore from trash' })
    async restore(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
        await this.tableService.restore(id);
        return {
            status: 'success',
            message: 'Record restored successfully.',
            statusCode: HttpStatus.OK
        };
    }

    @Delete(':id/permanent')
    @ApiOperation({ summary: 'Permanently delete' })
    async permanentDelete(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
        await this.tableService.permanentDelete(id);
        return {
            status: 'success',
            message: 'Record permanently deleted.',
            statusCode: HttpStatus.OK
        };
    }
}
