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
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationStatus } from './enum/reservation-status.enum';
import { ApiErrorResponses } from '../../common/decorators/api-error-responses.decorator';

@ApiTags('Reservations')
@ApiBearerAuth('staff-auth')
@ApiErrorResponses()
@Roles(UserRole.ADMIN, UserRole.MANAGER)
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create reservation', description: 'Creates a new reservation (admin)' })
  @ApiResponse({ status: 201, description: 'Reservation created successfully' })
  async create(@Body() dto: CreateReservationDto) {
    const reservation = await this.reservationsService.create(dto);
    return {
      data: reservation,
      status: 'success',
      message: 'Reservation created successfully.',
      statusCode: HttpStatus.CREATED,
    };
  }

    @Delete('bulk/delete')
    @ApiOperation({ summary: 'Bulk soft delete' })
    async bulkSoftDelete(@Body() body: { ids: string[] }): Promise<any> {
        await this.reservationsService.bulkSoftDelete(body.ids);
        return {
            status: 'success',
            message: `${body.ids.length} record(s) moved to trash.`,
            statusCode: HttpStatus.OK
        };
    }

    @Patch('bulk/restore')
    @ApiOperation({ summary: 'Bulk restore from trash' })
    async bulkRestore(@Body() body: { ids: string[] }): Promise<any> {
        await this.reservationsService.bulkRestore(body.ids);
        return {
            status: 'success',
            message: `${body.ids.length} record(s) restored.`,
            statusCode: HttpStatus.OK,
        };
    }

    @Delete('bulk/permanent')
    @ApiOperation({ summary: 'Bulk permanent delete' })
    async bulkPermanentDelete(@Body() body: { ids: string[] }): Promise<any> {
        const result = await this.reservationsService.bulkPermanentDelete(body.ids);
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
        const { data, total } = await this.reservationsService.findTrashed({ page: pageNumber, limit: limitNumber, search });
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
  @ApiOperation({ summary: 'List all reservations', description: 'Retrieves a paginated list of all reservations' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name, email, or phone' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status', enum: ReservationStatus })
  @ApiResponse({ status: 200, description: 'Reservations retrieved successfully' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: ReservationStatus,
  ) {
    const pageNumber = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;

    const result = await this.reservationsService.findAll({
      page: pageNumber,
      limit: limitNumber,
      search,
      status,
    });

    const totalPages = Math.ceil(result.total / limitNumber);

    return {
      data: result.data,
      total: result.total,
      page: pageNumber,
      limit: limitNumber,
      totalPages,
      status: 'success',
      message: 'Reservations retrieved successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get reservation by ID', description: 'Retrieves a single reservation by ID' })
  @ApiParam({ name: 'id', description: 'Reservation ID' })
  @ApiResponse({ status: 200, description: 'Reservation retrieved successfully' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const reservation = await this.reservationsService.findOne(id);
    return {
      data: reservation,
      status: 'success',
      message: 'Reservation retrieved successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update reservation', description: 'Updates an existing reservation' })
  @ApiParam({ name: 'id', description: 'Reservation ID' })
  @ApiResponse({ status: 200, description: 'Reservation updated successfully' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReservationDto,
  ) {
    const reservation = await this.reservationsService.update(id, dto);
    return {
      data: reservation,
      status: 'success',
      message: 'Reservation updated successfully.',
      statusCode: HttpStatus.OK,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete reservation', description: 'Deletes a reservation by ID' })
  @ApiParam({ name: 'id', description: 'Reservation ID' })
  @ApiResponse({ status: 200, description: 'Reservation deleted successfully' })
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.reservationsService.remove(id);
    return {
      status: 'success',
      message: 'Reservation deleted successfully.',
      statusCode: HttpStatus.OK,
    };
  }

    @Patch(':id/restore')
    @ApiOperation({ summary: 'Restore from trash' })
    async restore(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
        await this.reservationsService.restore(id);
        return {
            status: 'success',
            message: 'Record restored successfully.',
            statusCode: HttpStatus.OK
        };
    }

    @Delete(':id/permanent')
    @ApiOperation({ summary: 'Permanently delete' })
    async permanentDelete(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
        await this.reservationsService.permanentDelete(id);
        return {
            status: 'success',
            message: 'Record permanently deleted.',
            statusCode: HttpStatus.OK
        };
    }
}
