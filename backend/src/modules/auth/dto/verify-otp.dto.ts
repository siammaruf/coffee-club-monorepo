import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email or phone number used for password reset',
  })
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({
    example: '123456',
    description: 'OTP code received via email or SMS',
  })
  @IsString()
  @IsNotEmpty()
  otp: string;
}