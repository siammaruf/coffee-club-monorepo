import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'user@example.com or +8801712345678',
    description: 'Email address or phone number for password reset'
  })
  @IsString({ message: 'identifier must be a string' })
  @IsNotEmpty({ message: 'Email or phone number is required' })
  identifier: string;
}