import { ApiProperty } from '@nestjs/swagger';

export class KitchenStockItemDto {
    @ApiProperty({ description: 'Stock ID' })
    id: string;

    @ApiProperty({ description: 'Kitchen item details' })
    kitchen_item: {
        id: string;
        name: string;
        name_bn: string;
        type: string;
    };

    @ApiProperty({ description: 'Available quantity' })
    quantity: number;

    @ApiProperty({ description: 'Unit price' })
    price: number;

    @ApiProperty({ description: 'Total price' })
    total_price: number;

    @ApiProperty({ description: 'Description', required: false })
    description?: string;

    @ApiProperty({ description: 'Created date' })
    created_at: Date;

    @ApiProperty({ description: 'Updated date' })
    updated_at: Date;
}

export class MonthlyKitchenOrderDto {
    @ApiProperty({ description: 'Month in YYYY-MM format' })
    month: string;

    @ApiProperty({ description: 'Total orders in the month' })
    total_orders: number;

    @ApiProperty({ description: 'Total amount for the month' })
    total_amount: number;

    @ApiProperty({ description: 'Number of approved orders' })
    approved_orders: number;

    @ApiProperty({ description: 'Number of pending orders' })
    pending_orders: number;
}

export class CurrentMonthSummaryDto {
    @ApiProperty({ description: 'Total orders in current month' })
    total_orders: number;

    @ApiProperty({ description: 'Total amount in current month' })
    total_amount: number;

    @ApiProperty({ description: 'Approved orders in current month' })
    approved_orders: number;

    @ApiProperty({ description: 'Pending orders in current month' })
    pending_orders: number;

    @ApiProperty({ description: 'Total items ordered in current month' })
    total_items_ordered: number;
}

export class KitchenReportResponseDto {
    @ApiProperty({ type: [KitchenStockItemDto], description: 'Available kitchen stock items' })
    available_stock: KitchenStockItemDto[];

    @ApiProperty({ type: [MonthlyKitchenOrderDto], description: 'Kitchen orders grouped by month' })
    kitchen_orders_by_month: MonthlyKitchenOrderDto[];

    @ApiProperty({ type: CurrentMonthSummaryDto, description: 'Current month summary' })
    current_month_summary: CurrentMonthSummaryDto;

    @ApiProperty({ description: 'Report generation date' })
    report_date: Date;
}