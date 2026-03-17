import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class SendPhoneOtpDto {
  @ApiProperty({ description: 'New phone number to verify', example: '+8801712345678' })
  @IsString()
  @IsNotEmpty()
  phone: string;
}
