import { ApiProperty } from '@nestjs/swagger';

class DashboardMetricsDto {
  @ApiProperty({
    description: 'Today\'s total sales amount',
    example: 1250.75
  })
  todays_total_sales: number;

  @ApiProperty({
    description: 'Number of active orders (PENDING, PROCESSING)',
    example: 8
  })
  active_orders: number;

  @ApiProperty({
    description: 'Today\'s total expenses',
    example: 450.25
  })
  todays_expenses: number;

  @ApiProperty({
    description: 'Number of pending orders',
    example: 5
  })
  pending_orders: number;

  @ApiProperty({
    description: 'Number of takeaway orders today',
    example: 12
  })
  takeaway_orders: number;

  @ApiProperty({
    description: 'Number of dine-in orders today',
    example: 18
  })
  dinein_orders: number;

  @ApiProperty({
    description: 'Number of completed orders today',
    example: 25
  })
  completed_orders: number;

  @ApiProperty({
    description: 'Number of cancelled orders today',
    example: 2
  })
  cancelled_orders: number;

  @ApiProperty({
    description: 'Today\'s profit (sales - expenses)',
    example: 800.50
  })
  todays_profit: number;

  @ApiProperty({
    description: 'Total number of orders today',
    example: 37
  })
  total_orders_today: number;

  @ApiProperty({
    description: 'Average order value today',
    example: 33.80
  })
  average_order_value: number;

  @ApiProperty({
    description: 'Total number of customers in the system',
    example: 150
  })
  total_customers: number;

  @ApiProperty({
    description: 'Total number of tables in the restaurant',
    example: 25
  })
  total_tables: number;

  @ApiProperty({
    description: 'Total number of items in the menu',
    example: 85
  })
  total_items: number;

  @ApiProperty({
    description: 'Total number of sales reports generated',
    example: 120
  })
  total_sales_reports: number;

  @ApiProperty({
    description: 'Dashboard data generation timestamp',
    example: '2024-01-20T14:30:00.000Z'
  })
  generated_at: Date;
}

export class DashboardResponseDto {
  @ApiProperty({
    description: 'Dashboard metrics data',
    type: DashboardMetricsDto
  })
  data: DashboardMetricsDto;

  @ApiProperty({
    description: 'Response status',
    example: 'success'
  })
  status: string;

  @ApiProperty({
    description: 'Response message',
    example: 'Dashboard metrics retrieved successfully'
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 200
  })
  statusCode: number;
}