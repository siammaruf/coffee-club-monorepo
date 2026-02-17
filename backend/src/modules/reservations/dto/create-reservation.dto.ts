import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  IsDateString,
} from 'class-validator';
import { EventType } from '../enum/event-type.enum';

export class CreateReservationDto {
  @ApiProperty({ description: 'Guest name', example: 'Jane Smith' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Guest email', example: 'jane@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Guest phone number', example: '+1234567890' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ description: 'Reservation date (YYYY-MM-DD)', example: '2026-03-15' })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Reservation time (HH:mm)', example: '18:00' })
  @IsNotEmpty()
  @IsString()
  time: string;

  @ApiProperty({ description: 'Number of guests', example: 4, default: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  party_size?: number;

  @ApiProperty({
    description: 'Type of event',
    enum: EventType,
    default: EventType.DINING,
    required: false,
  })
  @IsOptional()
  @IsEnum(EventType)
  event_type?: EventType;

  @ApiProperty({ description: 'Special requests or notes', required: false })
  @IsOptional()
  @IsString()
  special_requests?: string;
}
