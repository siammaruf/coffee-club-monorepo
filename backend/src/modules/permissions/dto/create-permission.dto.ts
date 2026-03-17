import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ example: 'orders.view' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'orders' })
  @IsString()
  @IsNotEmpty()
  resource: string;

  @ApiProperty({ example: 'view' })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiPropertyOptional({ example: 'View all orders' })
  @IsString()
  @IsOptional()
  description?: string;
}
