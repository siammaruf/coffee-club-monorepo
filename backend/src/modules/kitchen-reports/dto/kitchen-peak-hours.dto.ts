import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class PeakHourItemDto {
    @ApiProperty({ example: 12, description: 'Hour of the day (0-23)' })
    @Expose()
    hour: number;

    @ApiProperty({ example: 15, description: 'Number of kitchen orders in this hour' })
    @Expose()
    orderCount: number;

    @ApiProperty({ example: 2500.50, description: 'Total sales in this hour' })
    @Expose()
    totalSales: number;
}

export class KitchenPeakHoursDto {
    @ApiProperty({ type: [PeakHourItemDto], description: 'Kitchen order data by hour' })
    @Expose()
    @Type(() => PeakHourItemDto)
    hours: PeakHourItemDto[];
}
