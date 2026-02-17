import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class StatusBreakdownDto {
    @ApiProperty({ example: 5, description: 'Number of pending tokens' })
    @Expose()
    pending: number;

    @ApiProperty({ example: 3, description: 'Number of preparing tokens' })
    @Expose()
    preparing: number;

    @ApiProperty({ example: 10, description: 'Number of ready tokens' })
    @Expose()
    ready: number;

    @ApiProperty({ example: 8, description: 'Number of delivered tokens' })
    @Expose()
    delivered: number;

    @ApiProperty({ example: 1, description: 'Number of cancelled tokens' })
    @Expose()
    cancelled: number;
}

export class KitchenSummaryDto {
    @ApiProperty({ example: 12500.50, description: 'Total kitchen sales amount' })
    @Expose()
    totalKitchenSales: number;

    @ApiProperty({ example: 45, description: 'Total kitchen order count' })
    @Expose()
    kitchenOrderCount: number;

    @ApiProperty({ type: StatusBreakdownDto, description: 'Breakdown by token status' })
    @Expose()
    @Type(() => StatusBreakdownDto)
    statusBreakdown: StatusBreakdownDto;

    @ApiProperty({ example: 12.5, description: 'Average preparation time in minutes' })
    @Expose()
    averagePreparationTime: number;
}
