import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetUserPasswordDto {
  @ApiProperty({ description: 'New password for the user', example: 'newPassword123', minLength: 6 })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  newPassword: string;
}
