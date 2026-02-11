import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CustomerLoginDto {
  @ApiProperty({ description: 'Email or phone number', example: 'john@example.com' })
  @IsNotEmpty()
  @IsString()
  identifier: string;

  @ApiProperty({ description: 'Customer password', example: 'password123' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
