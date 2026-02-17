import { Controller, Get, Post, Body, Param, Delete, Query, ParseUUIDPipe, HttpStatus, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ReportService } from '../providers/report.service';
import { DailyReportResponseDto } from '../dto/report-response.dto';
import { GenerateReportDto } from '../dto/generate-report.dto';
import { FinancialSummaryResponseDto } from '../dto/financial-summary-response.dto';
import { KitchenReportResponseDto } from '../dto/kitchen-report-response.dto';
import { DashboardResponseDto } from '../dto/dashboard-response.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/enum/user-role.enum';
import { ApiErrorResponses } from '../../../common/decorators/api-error-responses.decorator';

@ApiTags('Sales Reports')
@ApiBearerAuth('staff-auth')
@ApiErrorResponses()
@Controller('sales-reports')
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class SalesReportController {
    constructor(private readonly reportService: ReportService) {}

    @Get('financial-summary')
    @ApiOperation({ summary: 'Get overall financial summary (total sales, expenses, and current fund)' })
    @ApiResponse({ 
        status: 200, 
        description: 'Financial summary retrieved successfully', 
        type: FinancialSummaryResponseDto,
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'object',
                    properties: {
                        total_sales: {
                            type: 'number',
                            example: 15750.50,
                            description: 'Total sales amount'
                        },
                        total_expenses: {
                            type: 'number',
                            example: 4250.25,
                            description: 'Total expenses amount'
                        },
                        total_credit: {
                            type: 'number',
                            example: 1200.00,
                            description: 'Total credit amount'
                        },
                        current_fund: {
                            type: 'number',
                            example: 11500.25,
                            description: 'Current available fund (sales - expenses)'
                        },
                        total_orders: {
                            type: 'number',
                            example: 245,
                            description: 'Total number of orders'
                        },
                        total_expense_items: {
                            type: 'number',
                            example: 18,
                            description: 'Total number of expense items'
                        },
                        bar_sales: {
                            type: 'number',
                            example: 6200.75,
                            description: 'Sales from bar items'
                        },
                        kitchen_sales: {
                            type: 'number',
                            example: 9549.75,
                            description: 'Sales from kitchen items'
                        },
                        summary_date: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-20T14:30:00.000Z',
                            description: 'Date when summary was generated'
                        }
                    }
                },
                status: {
                    type: 'string',
                    example: 'success',
                    description: 'Response status'
                },
                message: {
                    type: 'string',
                    example: 'Financial summary retrieved successfully',
                    description: 'Response message'
                },
                statusCode: {
                    type: 'number',
                    example: 200,
                    description: 'HTTP status code'
                }
            }
        }
    })
    async getFinancialSummary() {
        const response = await this.reportService.getOverallFinancialSummary();
        return {
            data: new FinancialSummaryResponseDto(response),
            status: 'success',
            message: 'Financial summary retrieved successfully',
            statusCode: HttpStatus.OK
        };
    }

    @Get('kitchen-report')
    @ApiOperation({ summary: 'Get kitchen stock and orders report with flexible date filtering' })
    @ApiQuery({ 
        name: 'filterType', 
        required: false, 
        description: 'Filter type: month, year, or custom',
        enum: ['month', 'year', 'custom'],
        example: 'month'
    })
    @ApiQuery({ 
        name: 'filterValue', 
        required: false, 
        description: 'Filter value: YYYY-MM for month, YYYY for year',
        example: '2024-01'
    })
    @ApiQuery({ 
        name: 'startDate', 
        required: false, 
        description: 'Start date for custom filter (YYYY-MM-DD)',
        example: '2024-01-01'
    })
    @ApiQuery({ 
        name: 'endDate', 
        required: false, 
        description: 'End date for custom filter (YYYY-MM-DD)',
        example: '2024-01-31'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Kitchen report retrieved successfully',
        type: KitchenReportResponseDto
    })
    async getKitchenReport(
        @Query('filterType') filterType?: 'month' | 'year' | 'custom',
        @Query('filterValue') filterValue?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        const data = await this.reportService.getKitchenReport(filterType, filterValue, startDate, endDate);
        return {
            data,
            status: 'success',
            message: 'Kitchen report retrieved successfully',
            statusCode: HttpStatus.OK,
        };
    }

    @Post('generate')
    @ApiOperation({ summary: 'Manually generate daily sales report' })
    @ApiBody({ type: GenerateReportDto })
    @ApiResponse({ status: 201, description: 'Daily sales report generated successfully', type: DailyReportResponseDto })
    @ApiResponse({ status: 409, description: 'Sales report already exists for this date' })
    async generateReport(@Body() generateReportDto: GenerateReportDto) {
        const response = await this.reportService.generateReport(generateReportDto.report_date, false);
        return {
            data: response,
            status: 'success',
            message: 'Daily sales report generated successfully',
            statusCode: HttpStatus.CREATED
        };
    }

    @Post('regenerate/:date')
    @ApiOperation({ summary: 'Regenerate daily sales report for specific date' })
    @ApiParam({ name: 'date', description: 'Date in YYYY-MM-DD format' })
    @ApiResponse({ status: 200, description: 'Daily sales report regenerated successfully', type: DailyReportResponseDto })
    async regenerateReport(@Param('date') date: string) {
        const response = await this.reportService.regenerateReport(date);
        return {
            data: response,
            status: 'success',
            message: 'Daily sales report regenerated successfully',
            statusCode: HttpStatus.OK
        };
    }

    @Get()
    @ApiOperation({ summary: 'Get all daily sales reports with pagination' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
    @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
    @ApiResponse({ status: 200, description: 'Daily sales reports retrieved successfully' })
    async findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string
    ) {
        const pageNumber = page ? parseInt(page) : 1;
        const limitNumber = limit ? parseInt(limit) : 10;
        
        const response = await this.reportService.findAll(pageNumber, limitNumber);
        return {
            data: response.data,
            total: response.total,
            page: response.page,
            limit: response.limit,
            totalPages: response.totalPages,
            status: 'success',
            message: 'Daily sales reports retrieved successfully',
            statusCode: HttpStatus.OK
        };
    }

    @Get('by-date/:date')
    @ApiOperation({ summary: 'Get daily sales report by date' })
    @ApiParam({ name: 'date', description: 'Date in YYYY-MM-DD format' })
    @ApiResponse({ status: 200, description: 'Daily sales report retrieved successfully', type: DailyReportResponseDto })
    @ApiResponse({ status: 404, description: 'Daily sales report not found' })
    async findByDate(@Param('date') date: string) {
        const response = await this.reportService.findByDate(date);
        return {
            data: response,
            status: 'success',
            message: 'Daily sales report retrieved successfully',
            statusCode: HttpStatus.OK
        };
    }

    @Get('filtered-summary')
    @ApiOperation({ 
        summary: 'Get filtered daily reports with comprehensive summary',
        description: 'Retrieves filtered daily reports with detailed summary statistics including trends, best/worst days, and averages'
    })
    @ApiQuery({ 
        name: 'filterType', 
        required: false, 
        description: 'Filter type: month, year, or custom (default: month)',
        enum: ['month', 'year', 'custom'],
        example: 'month'
    })
    @ApiQuery({ 
        name: 'filterValue', 
        required: false, 
        description: 'Filter value: YYYY-MM for month, YYYY for year',
        example: '2024-01'
    })
    @ApiQuery({ 
        name: 'startDate', 
        required: false, 
        description: 'Start date for custom filter (YYYY-MM-DD)',
        example: '2024-01-01'
    })
    @ApiQuery({ 
        name: 'endDate', 
        required: false, 
        description: 'End date for custom filter (YYYY-MM-DD)',
        example: '2024-01-31'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Filtered reports with summary retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'object',
                    properties: {
                        reports: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/DailyReportResponseDto' }
                        },
                        summary: {
                            type: 'object',
                            properties: {
                                period: { type: 'string', example: '2024-01' },
                                total_sales: { type: 'number', example: 15750.50 },
                                total_expenses: { type: 'number', example: 4250.25 },
                                total_profit: { type: 'number', example: 11500.25 },
                                total_orders: { type: 'number', example: 245 },
                                total_days: { type: 'number', example: 31 },
                                average_daily_sales: { type: 'number', example: 508.08 },
                                average_daily_orders: { type: 'number', example: 7.9 },
                                best_sales_day: {
                                    type: 'object',
                                    properties: {
                                        date: { type: 'string', example: '2024-01-15' },
                                        amount: { type: 'number', example: 850.75 }
                                    }
                                },
                                worst_sales_day: {
                                    type: 'object',
                                    properties: {
                                        date: { type: 'string', example: '2024-01-03' },
                                        amount: { type: 'number', example: 125.50 }
                                    }
                                },
                                sales_trend: {
                                    type: 'object',
                                    properties: {
                                        increasing_days: { type: 'number', example: 18 },
                                        decreasing_days: { type: 'number', example: 10 },
                                        stable_days: { type: 'number', example: 2 }
                                    }
                                },
                                filter_info: {
                                    type: 'object',
                                    properties: {
                                        type: { type: 'string', example: 'month' },
                                        value: { type: 'string', example: '2024-01' },
                                        start_date: { type: 'string', example: '2024-01-01' },
                                        end_date: { type: 'string', example: '2024-01-31' }
                                    }
                                }
                            }
                        },
                        report_date: { type: 'string', format: 'date-time', example: '2024-01-20T14:30:00.000Z' }
                    }
                },
                status: { type: 'string', example: 'success' },
                message: { type: 'string', example: 'Filtered reports with summary retrieved successfully' },
                statusCode: { type: 'number', example: 200 }
            }
        }
    })
    async getFilteredReportsWithSummary(
        @Query('filterType') filterType?: 'month' | 'year' | 'custom',
        @Query('filterValue') filterValue?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        const data = await this.reportService.getFilteredReportsWithSummary(
            filterType, 
            filterValue, 
            startDate, 
            endDate
        );
        
        return {
            data,
            status: 'success',
            message: 'Filtered reports with summary retrieved successfully',
            statusCode: HttpStatus.OK
        };
    }

    @Get('dashboard')
    @ApiOperation({ 
        summary: 'Get dashboard metrics',
        description: 'Retrieves key metrics for today including sales, orders, expenses, and various order statistics'
    })
    @ApiResponse({
        status: 200,
        description: 'Dashboard metrics retrieved successfully',
        type: DashboardResponseDto
    })
    async getDashboard(): Promise<DashboardResponseDto> {
        const metrics = await this.reportService.getDashboardMetrics();
        return {
            data: metrics,
            status: 'success',
            message: 'Dashboard metrics retrieved successfully',
            statusCode: HttpStatus.OK
        };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get daily sales report by ID' })
    @ApiParam({ name: 'id', description: 'Daily sales report UUID' })
    @ApiResponse({ status: 200, description: 'Daily sales report retrieved successfully', type: DailyReportResponseDto })
    @ApiResponse({ status: 404, description: 'Daily sales report not found' })
    async findOne(@Param('id', ParseUUIDPipe) id: string) {
        const response = await this.reportService.findOne(id);
        return {
            data: response,
            status: 'success',
            message: 'Daily sales report retrieved successfully',
            statusCode: HttpStatus.OK
        };
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete daily sales report' })
    @ApiParam({ name: 'id', description: 'Daily sales report UUID' })
    @ApiResponse({ status: 200, description: 'Daily sales report deleted successfully' })
    @ApiResponse({ status: 404, description: 'Daily sales report not found' })
    async remove(@Param('id', ParseUUIDPipe) id: string) {
        const response = await this.reportService.remove(id);
        return {
            data: response,
            status: 'success',
            message: 'Daily sales report deleted successfully',
            statusCode: HttpStatus.OK
        };
    }

    @Get('charts/sales-progress')
    @ApiOperation({ summary: 'Get sales progress data for charts' })
    @ApiQuery({
        name: 'period',
        required: false,
        enum: ['daily', 'monthly', 'yearly'],
        description: 'Time period for sales progress (daily, monthly, yearly)',
        example: 'daily'
    })
    @ApiQuery({
        name: 'filterType',
        required: false,
        enum: ['month', 'year', 'custom'],
        description: 'Type of date filter to apply'
    })
    @ApiQuery({
        name: 'filterValue',
        required: false,
        description: 'Value for month (1-12) or year (YYYY) filter'
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        description: 'Start date for custom range (YYYY-MM-DD)'
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        description: 'End date for custom range (YYYY-MM-DD)'
    })
    @ApiResponse({
        status: 200,
        description: 'Sales progress chart data retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Sales progress data retrieved successfully' },
                data: {
                    type: 'object',
                    properties: {
                        chartData: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    period: { type: 'string', example: '2024-01-15' },
                                    sales: { type: 'number', example: 1250.50 },
                                    orders: { type: 'number', example: 25 }
                                }
                            }
                        },
                        summary: {
                            type: 'object',
                            properties: {
                                totalSales: { type: 'number', example: 15000.75 },
                                totalOrders: { type: 'number', example: 300 },
                                averageSales: { type: 'number', example: 500.25 },
                                growthRate: { type: 'number', example: 12.5 }
                            }
                        }
                    }
                }
            }
        }
    })
    async getSalesProgressChart(
        @Query('period') period: 'daily' | 'monthly' | 'yearly' = 'daily',
        @Query('filterType') filterType?: 'month' | 'year' | 'custom',
        @Query('filterValue') filterValue?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        try {
            const data = await this.reportService.getSalesProgressForCharts(
                period,
                filterType,
                filterValue,
                startDate,
                endDate
            );
            
            return {
                status: 'success',
                message: 'Sales progress data retrieved successfully',
                data,
                statusCode: HttpStatus.OK,
            };
        } catch (error) {
            throw new BadRequestException({
                success: false,
                message: 'Failed to retrieve sales progress data',
                error: error.message
            });
        }
    }

    @Get('charts/expenses')
    @ApiOperation({ summary: 'Get expenses data for charts' })
    @ApiQuery({
        name: 'period',
        required: false,
        enum: ['daily', 'monthly', 'yearly'],
        description: 'Time period for expenses data (daily, monthly, yearly)',
        example: 'monthly'
    })
    @ApiQuery({
        name: 'filterType',
        required: false,
        enum: ['month', 'year', 'custom'],
        description: 'Type of date filter to apply'
    })
    @ApiQuery({
        name: 'filterValue',
        required: false,
        description: 'Value for month (1-12) or year (YYYY) filter'
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        description: 'Start date for custom range (YYYY-MM-DD)'
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        description: 'End date for custom range (YYYY-MM-DD)'
    })
    @ApiQuery({
        name: 'categoryId',
        required: false,
        description: 'Filter by specific expense category ID'
    })
    @ApiResponse({
        status: 200,
        description: 'Expenses chart data retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Expenses data retrieved successfully' },
                data: {
                    type: 'object',
                    properties: {
                        chartData: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    period: { type: 'string', example: '2024-01' },
                                    amount: { type: 'number', example: 850.25 },
                                    category: { type: 'string', example: 'Staff Salary' },
                                    count: { type: 'number', example: 5 }
                                }
                            }
                        },
                        categoryBreakdown: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    category: { type: 'string', example: 'Staff Salary' },
                                    totalAmount: { type: 'number', example: 5000.00 },
                                    percentage: { type: 'number', example: 45.5 },
                                    count: { type: 'number', example: 10 }
                                }
                            }
                        },
                        summary: {
                            type: 'object',
                            properties: {
                                totalExpenses: { type: 'number', example: 11000.50 },
                                totalTransactions: { type: 'number', example: 45 },
                                averageExpense: { type: 'number', example: 244.46 },
                                topCategory: { type: 'string', example: 'Staff Salary' }
                            }
                        }
                    }
                }
            }
        }
    })
    async getExpensesChart(
        @Query('period') period: 'daily' | 'monthly' | 'yearly' = 'monthly',
        @Query('filterType') filterType?: 'month' | 'year' | 'custom',
        @Query('filterValue') filterValue?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('categoryId') categoryId?: string,
    ) {
        try {
            const data = await this.reportService.getExpensesForCharts(
                period as 'line' | 'bar' | 'pie' | 'donut',
                filterType as 'month' | 'year' | 'day',
                filterValue as 'month' | 'year' | 'custom' | undefined,
                startDate,
                endDate,
                categoryId
            );
            
            return {
                status: 'success',
                message: 'Expenses data retrieved successfully',
                data,
                statusCode: HttpStatus.OK,
            };
        } catch (error) {
            throw new BadRequestException({
                success: false,
                message: 'Failed to retrieve expenses data',
                error: error.message
            });
        }
    }
}