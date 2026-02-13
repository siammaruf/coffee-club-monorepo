import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEmail,
  IsEnum,
  IsInt,
  Min,
  IsDateString,
} from 'class-validator';
import { EventType } from '../enum/event-type.enum';
import { ReservationStatus } from '../enum/reservation-status.enum';

export class UpdateReservationDto {
  @ApiProperty({ description: 'Guest name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Guest email', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Guest phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Reservation date (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ description: 'Reservation time (HH:mm)', required: false })
  @IsOptional()
  @IsString()
  time?: string;

  @ApiProperty({ description: 'Number of guests', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  party_size?: number;

  @ApiProperty({ description: 'Type of event', enum: EventType, required: false })
  @IsOptional()
  @IsEnum(EventType)
  event_type?: EventType;

  @ApiProperty({ description: 'Special requests or notes', required: false })
  @IsOptional()
  @IsString()
  special_requests?: string;

  @ApiProperty({ description: 'Reservation status', enum: ReservationStatus, required: false })
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;
}
