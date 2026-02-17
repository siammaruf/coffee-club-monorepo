import { Controller, Get, Param, Query, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { KitchenReportsService } from './providers/kitchen-reports.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enum/user-role.enum';
import { ApiErrorResponses } from '../../common/decorators/api-error-responses.decorator';

@ApiTags('Kitchen Reports')
@ApiBearerAuth('staff-auth')
@ApiErrorResponses()
@Controller('kitchen-reports')
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class KitchenReportsController {
    constructor(private readonly kitchenReportsService: KitchenReportsService) {}

    // ──────────────────────────────────────────────
    // 1. GET /kitchen-reports/summary
    // ──────────────────────────────────────────────

    @Get('summary')
    @ApiOperation({
        summary: 'Get kitchen summary report',
        description: 'Returns total kitchen sales, order count, status breakdown, and average preparation time for the specified date range.',
    })
    @ApiQuery({ name: 'date', required: false, description: 'Specific date (YYYY-MM-DD). Defaults to today.', example: '2025-01-15' })
    @ApiQuery({ name: 'startDate', required: false, description: 'Start date for custom range (YYYY-MM-DD)', example: '2025-01-01' })
    @ApiQuery({ name: 'endDate', required: false, description: 'End date for custom range (YYYY-MM-DD)', example: '2025-01-31' })
    @ApiQuery({ name: 'filterType', required: false, description: 'Filter type', enum: ['month', 'year', 'custom'] })
    @ApiQuery({ name: 'filterValue', required: false, description: 'Filter value: YYYY-MM for month, YYYY for year', example: '2025-01' })
    @ApiResponse({ status: 200, description: 'Kitchen summary retrieved successfully' })
    async getSummary(
        @Query('date') date?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('filterType') filterType?: string,
        @Query('filterValue') filterValue?: string,
    ) {
        const data = await this.kitchenReportsService.getSummary(date, startDate, endDate, filterType, filterValue);
        return {
            data,
            status: 'success',
            message: 'Kitchen summary retrieved successfully',
            statusCode: HttpStatus.OK,
        };
    }

    // ──────────────────────────────────────────────
    // 2. GET /kitchen-reports/by-date/:date
    // ──────────────────────────────────────────────

    @Get('by-date/:date')
    @ApiOperation({
        summary: 'Get kitchen summary for a specific date',
        description: 'Returns kitchen summary for the given date. Date must be in YYYY-MM-DD format.',
    })
    @ApiParam({ name: 'date', description: 'Date in YYYY-MM-DD format', example: '2025-01-15' })
    @ApiResponse({ status: 200, description: 'Kitchen summary for date retrieved successfully' })
    @ApiResponse({ status: 400, description: 'Invalid date format' })
    async getSummaryByDate(@Param('date') date: string) {
        const data = await this.kitchenReportsService.getSummaryByDate(date);
        return {
            data,
            status: 'success',
            message: 'Kitchen summary for date retrieved successfully',
            statusCode: HttpStatus.OK,
        };
    }

    // ──────────────────────────────────────────────
    // 3. GET /kitchen-reports/efficiency
    // ──────────────────────────────────────────────

    @Get('efficiency')
    @ApiOperation({
        summary: 'Get kitchen efficiency metrics',
        description: 'Returns avg/min/max preparation times, time distribution buckets, and breakdown by priority level.',
    })
    @ApiQuery({ name: 'date', required: false, description: 'Specific date (YYYY-MM-DD)', example: '2025-01-15' })
    @ApiQuery({ name: 'startDate', required: false, description: 'Start date for custom range (YYYY-MM-DD)', example: '2025-01-01' })
    @ApiQuery({ name: 'endDate', required: false, description: 'End date for custom range (YYYY-MM-DD)', example: '2025-01-31' })
    @ApiQuery({ name: 'filterType', required: false, description: 'Filter type', enum: ['month', 'year', 'custom'] })
    @ApiQuery({ name: 'filterValue', required: false, description: 'Filter value: YYYY-MM for month, YYYY for year', example: '2025-01' })
    @ApiResponse({ status: 200, description: 'Kitchen efficiency metrics retrieved successfully' })
    async getEfficiency(
        @Query('date') date?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('filterType') filterType?: string,
        @Query('filterValue') filterValue?: string,
    ) {
        const data = await this.kitchenReportsService.getEfficiency(date, startDate, endDate, filterType, filterValue);
        return {
            data,
            status: 'success',
            message: 'Kitchen efficiency metrics retrieved successfully',
            statusCode: HttpStatus.OK,
        };
    }

    // ──────────────────────────────────────────────
    // 4. GET /kitchen-reports/item-performance
    // ──────────────────────────────────────────────

    @Get('item-performance')
    @ApiOperation({
        summary: 'Get kitchen item performance',
        description: 'Returns top performing kitchen items sorted by revenue with quantity sold and percentage of total.',
    })
    @ApiQuery({ name: 'date', required: false, description: 'Specific date (YYYY-MM-DD)', example: '2025-01-15' })
    @ApiQuery({ name: 'startDate', required: false, description: 'Start date for custom range (YYYY-MM-DD)', example: '2025-01-01' })
    @ApiQuery({ name: 'endDate', required: false, description: 'End date for custom range (YYYY-MM-DD)', example: '2025-01-31' })
    @ApiQuery({ name: 'filterType', required: false, description: 'Filter type', enum: ['month', 'year', 'custom'] })
    @ApiQuery({ name: 'filterValue', required: false, description: 'Filter value: YYYY-MM for month, YYYY for year', example: '2025-01' })
    @ApiQuery({ name: 'limit', required: false, description: 'Number of top items to return (default: 10)', example: '10' })
    @ApiResponse({ status: 200, description: 'Kitchen item performance retrieved successfully' })
    async getItemPerformance(
        @Query('date') date?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('filterType') filterType?: string,
        @Query('filterValue') filterValue?: string,
        @Query('limit') limit?: string,
    ) {
        const limitNumber = limit ? parseInt(limit, 10) : 10;
        const data = await this.kitchenReportsService.getItemPerformance(date, startDate, endDate, filterType, filterValue, limitNumber);
        return {
            data,
            status: 'success',
            message: 'Kitchen item performance retrieved successfully',
            statusCode: HttpStatus.OK,
        };
    }

    // ──────────────────────────────────────────────
    // 5. GET /kitchen-reports/peak-hours
    // ──────────────────────────────────────────────

    @Get('peak-hours')
    @ApiOperation({
        summary: 'Get kitchen peak hours',
        description: 'Returns kitchen order counts and sales grouped by hour of the day (0-23).',
    })
    @ApiQuery({ name: 'date', required: false, description: 'Specific date (YYYY-MM-DD)', example: '2025-01-15' })
    @ApiQuery({ name: 'startDate', required: false, description: 'Start date for custom range (YYYY-MM-DD)', example: '2025-01-01' })
    @ApiQuery({ name: 'endDate', required: false, description: 'End date for custom range (YYYY-MM-DD)', example: '2025-01-31' })
    @ApiQuery({ name: 'filterType', required: false, description: 'Filter type', enum: ['month', 'year', 'custom'] })
    @ApiQuery({ name: 'filterValue', required: false, description: 'Filter value: YYYY-MM for month, YYYY for year', example: '2025-01' })
    @ApiResponse({ status: 200, description: 'Kitchen peak hours retrieved successfully' })
    async getPeakHours(
        @Query('date') date?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('filterType') filterType?: string,
        @Query('filterValue') filterValue?: string,
    ) {
        const data = await this.kitchenReportsService.getPeakHours(date, startDate, endDate, filterType, filterValue);
        return {
            data,
            status: 'success',
            message: 'Kitchen peak hours retrieved successfully',
            statusCode: HttpStatus.OK,
        };
    }

    // ──────────────────────────────────────────────
    // 6. GET /kitchen-reports/comparison
    // ──────────────────────────────────────────────

    @Get('comparison')
    @ApiOperation({
        summary: 'Get kitchen vs bar comparison',
        description: 'Returns side-by-side comparison of kitchen and bar metrics including sales, orders, average order value, and preparation time.',
    })
    @ApiQuery({ name: 'date', required: false, description: 'Specific date (YYYY-MM-DD)', example: '2025-01-15' })
    @ApiQuery({ name: 'startDate', required: false, description: 'Start date for custom range (YYYY-MM-DD)', example: '2025-01-01' })
    @ApiQuery({ name: 'endDate', required: false, description: 'End date for custom range (YYYY-MM-DD)', example: '2025-01-31' })
    @ApiQuery({ name: 'filterType', required: false, description: 'Filter type', enum: ['month', 'year', 'custom'] })
    @ApiQuery({ name: 'filterValue', required: false, description: 'Filter value: YYYY-MM for month, YYYY for year', example: '2025-01' })
    @ApiResponse({ status: 200, description: 'Kitchen vs bar comparison retrieved successfully' })
    async getComparison(
        @Query('date') date?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('filterType') filterType?: string,
        @Query('filterValue') filterValue?: string,
    ) {
        const data = await this.kitchenReportsService.getComparison(date, startDate, endDate, filterType, filterValue);
        return {
            data,
            status: 'success',
            message: 'Kitchen vs bar comparison retrieved successfully',
            statusCode: HttpStatus.OK,
        };
    }
}
