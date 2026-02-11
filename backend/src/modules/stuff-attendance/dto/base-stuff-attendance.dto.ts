import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min, Max, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '../enum/attendance-status.enum';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class BaseStuffAttendanceDto {
  @ApiPropertyOptional({ 
    description: 'Unique identifier for the attendance record',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsUUID(4, { message: 'Attendance ID must be a valid UUID' })
  @IsOptional()
  id?: string;

  @ApiProperty({ 
    description: 'ID of the user for this attendance record',
    format: 'uuid'
  })
  @IsUUID(4)
  user_id?: string;

  @ApiProperty({ 
    description: 'User information for this attendance record',
    type: () => UserResponseDto
  })
  @Type(() => UserResponseDto)
  user: UserResponseDto;

  @ApiProperty({ 
    description: 'Date of attendance record', 
    type: 'string',
    format: 'date',
    example: '2025-01-15'
  })
  @IsDate({ message: 'Attendance date must be a valid date' })
  @Type(() => Date)
  attendance_date: Date;

  @ApiPropertyOptional({ 
    description: 'Time when user checked in for work', 
    type: 'string',
    format: 'time',
    example: '09:00:00'
  })
  @IsDate({ message: 'Check-in time must be a valid time' })
  @IsOptional()
  @Type(() => Date)
  check_in?: Date;

  @ApiPropertyOptional({ 
    description: 'Time when user checked out from work', 
    type: 'string',
    format: 'time',
    example: '17:30:00'
  })
  @IsDate({ message: 'Check-out time must be a valid time' })
  @IsOptional()
  @Type(() => Date)
  check_out?: Date;

  @ApiPropertyOptional({ 
    description: 'Attendance status for the day',
    enum: AttendanceStatus, 
    default: AttendanceStatus.PRESENT,
    example: AttendanceStatus.PRESENT,
    enumName: 'AttendanceStatus'
  })
  @IsEnum(AttendanceStatus, { message: 'Status must be a valid attendance status' })
  @IsOptional()
  status?: AttendanceStatus;

  @ApiPropertyOptional({ 
    description: 'Total work hours for the day (0-24 hours)', 
    type: 'number',
    format: 'decimal',
    minimum: 0,
    maximum: 24,
    example: 8.5
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Work hours must be a valid number with max 2 decimal places' })
  @Min(0, { message: 'Work hours cannot be negative' })
  @Max(24, { message: 'Work hours cannot exceed 24 hours per day' })
  @IsOptional()
  work_hours?: number;

  @ApiPropertyOptional({ 
    description: 'Overtime hours worked beyond regular hours', 
    type: 'number',
    format: 'decimal',
    minimum: 0,
    maximum: 12,
    example: 2.0
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Overtime hours must be a valid number with max 2 decimal places' })
  @Min(0, { message: 'Overtime hours cannot be negative' })
  @Max(12, { message: 'Overtime hours cannot exceed 12 hours per day' })
  @IsOptional()
  overtime_hours?: number;

  @ApiPropertyOptional({ 
    description: 'Additional notes or remarks about attendance', 
    type: 'string',
    maxLength: 1000,
    example: 'Left early for medical appointment with prior approval'
  })
  @IsString({ message: 'Notes must be a valid string' })
  @IsOptional()
  notes?: string;

  @ApiProperty({ 
    description: 'User information for this attendance record',
    type: () => UserResponseDto
  })
  @Type(() => UserResponseDto)
  approver: UserResponseDto;

  @ApiPropertyOptional({ 
    description: 'UUID of the user who approved this attendance record',
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440001'
  })
  @IsUUID(4, { message: 'Approved by must be a valid UUID' })
  @IsOptional()
  approved_by?: string;

  @ApiPropertyOptional({ 
    description: 'Whether this attendance record has been approved by a supervisor', 
    type: 'boolean',
    default: false,
    example: false
  })
  @IsBoolean({ message: 'Approval status must be a boolean value' })
  @IsOptional()
  is_approved?: boolean;
}