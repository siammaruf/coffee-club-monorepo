import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
} from 'class-validator';

export class CreatePartnerDto {
  @ApiProperty({ description: 'Partner name', example: 'Coffee Bean Supplier Co.' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Logo URL', example: 'https://example.com/logo.png' })
  @IsNotEmpty()
  @IsString()
  logo: string;

  @ApiProperty({ description: 'Partner website URL', required: false, example: 'https://example.com' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ description: 'Sort order for display', required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number;

  @ApiProperty({ description: 'Whether the partner is active', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
