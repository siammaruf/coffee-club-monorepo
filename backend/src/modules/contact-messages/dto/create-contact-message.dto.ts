import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
} from 'class-validator';

export class CreateContactMessageDto {
  @ApiProperty({ description: 'Sender name', example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Sender email', example: 'john@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Sender phone number', required: false, example: '+1234567890' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Message subject', required: false, example: 'Reservation inquiry' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ description: 'Message content', example: 'I would like to know about your catering services.' })
  @IsNotEmpty()
  @IsString()
  message: string;
}
