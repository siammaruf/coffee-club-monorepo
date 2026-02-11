import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CustomerVerifyOtpDto {
  @ApiProperty({ description: 'Email or phone number', example: 'john@example.com' })
  @IsNotEmpty()
  @IsString()
  identifier: string;

  @ApiProperty({ description: 'OTP code', example: '123456' })
  @IsNotEmpty()
  @IsString()
  otp: string;
}
