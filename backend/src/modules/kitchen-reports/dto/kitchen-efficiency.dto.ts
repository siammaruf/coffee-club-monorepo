import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class TimeDistributionDto {
    @ApiProperty({ example: 5, description: 'Tokens completed under 5 minutes' })
    @Expose()
    under5Min: number;

    @ApiProperty({ example: 15, description: 'Tokens completed in 5-15 minutes' })
    @Expose()
    fiveTo15Min: number;

    @ApiProperty({ example: 8, description: 'Tokens completed in 15-30 minutes' })
    @Expose()
    fifteenTo30Min: number;

    @ApiProperty({ example: 2, description: 'Tokens completed over 30 minutes' })
    @Expose()
    over30Min: number;
}

export class PriorityBreakdownItemDto {
    @ApiProperty({ example: 'Normal', description: 'Priority level' })
    @Expose()
    priority: string;

    @ApiProperty({ example: 20, description: 'Number of tokens with this priority' })
    @Expose()
    count: number;

    @ApiProperty({ example: 12.5, description: 'Average preparation time in minutes' })
    @Expose()
    avgTime: number;

    @ApiProperty({ example: 95.0, description: 'Completion rate as percentage' })
    @Expose()
    completionRate: number;
}

export class KitchenEfficiencyDto {
    @ApiProperty({ example: 12.5, description: 'Average preparation time in minutes' })
    @Expose()
    avgPreparationTime: number;

    @ApiProperty({ example: 2.0, description: 'Minimum preparation time in minutes' })
    @Expose()
    minPreparationTime: number;

    @ApiProperty({ example: 45.0, description: 'Maximum preparation time in minutes' })
    @Expose()
    maxPreparationTime: number;

    @ApiProperty({ type: TimeDistributionDto, description: 'Distribution of preparation times' })
    @Expose()
    @Type(() => TimeDistributionDto)
    timeDistribution: TimeDistributionDto;

    @ApiProperty({ type: [PriorityBreakdownItemDto], description: 'Breakdown by priority level' })
    @Expose()
    @Type(() => PriorityBreakdownItemDto)
    priorityBreakdown: PriorityBreakdownItemDto[];
}
