import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class TopItemDto {
    @ApiProperty({ example: 'a1b2c3d4-...', description: 'Item UUID' })
    @Expose()
    itemId: string;

    @ApiProperty({ example: 'Grilled Chicken', description: 'Item name' })
    @Expose()
    itemName: string;

    @ApiProperty({ example: 25, description: 'Total quantity sold' })
    @Expose()
    quantitySold: number;

    @ApiProperty({ example: 3750.00, description: 'Total revenue from this item' })
    @Expose()
    revenue: number;

    @ApiProperty({ example: 15.5, description: 'Percentage of total kitchen revenue' })
    @Expose()
    percentageOfTotal: number;
}

export class KitchenItemPerformanceDto {
    @ApiProperty({ type: [TopItemDto], description: 'Top performing kitchen items sorted by revenue' })
    @Expose()
    @Type(() => TopItemDto)
    topItems: TopItemDto[];
}
