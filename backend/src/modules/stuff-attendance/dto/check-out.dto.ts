import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CheckOutDto {
  @ApiPropertyOptional({ description: 'Optional notes for check-out' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Overtime hours worked', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  overtime_hours?: number;
}
