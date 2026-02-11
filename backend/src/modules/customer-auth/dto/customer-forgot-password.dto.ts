import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CustomerForgotPasswordDto {
  @ApiProperty({ description: 'Email or phone number', example: 'john@example.com' })
  @IsNotEmpty()
  @IsString()
  identifier: string;
}
