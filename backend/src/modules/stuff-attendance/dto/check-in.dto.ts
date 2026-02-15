import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CheckInDto {
  @ApiPropertyOptional({ description: 'Optional notes for check-in' })
  @IsOptional()
  @IsString()
  notes?: string;
}
