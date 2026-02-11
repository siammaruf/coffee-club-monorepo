import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'user123',
    description: 'Username, email or phone number',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example: 'Password123',
    description: 'User password',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
  
  @ApiProperty({
    example: true,
    description: 'Remember me option for extended session',
    required: false,
    default: false
  })
  @IsBoolean()
  @IsOptional()
  rememberMe?: boolean;
  
  @ApiProperty({
    example: 'password',
    description: 'OAuth2 grant type',
    required: false
  })
  @IsString()
  @IsOptional()
  grant_type?: string;
}