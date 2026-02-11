import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CustomerResetPasswordDto {
  @ApiProperty({ description: 'Password reset token' })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({ description: 'New password (min 6 characters)', example: 'newpassword123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
