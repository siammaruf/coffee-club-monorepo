import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class ForgotPasswordSmsDto {
  @ApiProperty({
    example: '+8801712345678',
    description: 'Phone number for password reset',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[0-9]{10,15}$/, {
    message: 'Phone number must be valid',
  })
  phone: string;
}