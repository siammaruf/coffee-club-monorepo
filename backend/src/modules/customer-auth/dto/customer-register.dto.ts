import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CustomerRegisterDto {
  @ApiProperty({ description: 'Customer full name', example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Customer email address', example: 'john@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Customer phone number', example: '+8801712345678' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ description: 'Customer password (min 6 characters)', example: 'password123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
