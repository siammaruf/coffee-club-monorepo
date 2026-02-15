import {
  Controller,
  Get,
  Query,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ReservationsService } from './reservations.service';
import { CustomerJwtAuthGuard } from '../customer-auth/guards/customer-jwt-auth.guard';
import { CurrentCustomer } from '../../common/decorators/customer.decorator';
import { Customer } from '../customers/entities/customer.entity';
import { Public } from '../../common/decorators/public.decorator';
import { ApiErrorResponses } from '../../common/decorators/api-error-responses.decorator';

@ApiTags('Customer Reservations')
@ApiBearerAuth('customer-auth')
@ApiErrorResponses()
@Public()
@Controller('customer/reservations')
@UseGuards(CustomerJwtAuthGuard)
export class CustomerReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get customer reservations', description: 'Retrieves paginated list of reservations for the authenticated customer' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
  @ApiResponse({ status: 200, description: 'Reservations retrieved successfully' })
  async getMyReservations(
    @CurrentCustomer() customer: Customer,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;

    const result = await this.reservationsService.findByCustomer(customer.id, {
      page: pageNumber,
      limit: limitNumber,
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
}
