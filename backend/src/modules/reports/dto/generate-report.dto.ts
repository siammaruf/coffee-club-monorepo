import { IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateReportDto {
    @ApiProperty({ 
        description: 'Date for which to generate the report (YYYY-MM-DD format)', 
        example: '2024-01-15',
        required: false 
    })
    @IsOptional()
    @IsDateString()
    report_date?: string;
}