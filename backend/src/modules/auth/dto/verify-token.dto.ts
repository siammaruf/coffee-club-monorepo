import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyTokenDto {
  @ApiProperty({
    example: 'valid-reset-token',
    description: 'Password reset token to verify',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}