import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangeCustomerPasswordDto {
  @ApiProperty({ description: 'Current password', example: 'oldpassword123' })
  @IsNotEmpty()
  @IsString()
  current_password: string;

  @ApiProperty({ description: 'New password (min 6 characters)', example: 'newpassword123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  new_password: string;
}
