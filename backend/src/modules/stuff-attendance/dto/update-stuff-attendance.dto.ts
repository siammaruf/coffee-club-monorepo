import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseStuffAttendanceDto } from './base-stuff-attendance.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateStuffAttendanceDto extends PartialType(BaseStuffAttendanceDto) {
  @ApiPropertyOptional({ 
    description: 'ID of the user for this attendance record',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsUUID(4, { message: 'User ID must be a valid UUID' })
  @IsOptional()
  user_id?: string;
}