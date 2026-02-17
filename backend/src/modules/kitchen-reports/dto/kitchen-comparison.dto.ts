import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class SectionMetricsDto {
    @ApiProperty({ example: 12500.50, description: 'Total sales amount' })
    @Expose()
    sales: number;

    @ApiProperty({ example: 45, description: 'Total number of orders' })
    @Expose()
    orders: number;

    @ApiProperty({ example: 277.79, description: 'Average order value' })
    @Expose()
    avgOrderValue: number;

    @ApiProperty({ example: 12.5, description: 'Average preparation time in minutes' })
    @Expose()
    avgPrepTime: number;
}

export class KitchenComparisonDto {
    @ApiProperty({ type: SectionMetricsDto, description: 'Kitchen section metrics' })
    @Expose()
    @Type(() => SectionMetricsDto)
    kitchen: SectionMetricsDto;

    @ApiProperty({ type: SectionMetricsDto, description: 'Bar section metrics' })
    @Expose()
    @Type(() => SectionMetricsDto)
    bar: SectionMetricsDto;
}
