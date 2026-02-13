import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsInt,
  Min,
} from 'class-validator';

export class UpdatePartnerDto {
  @ApiProperty({ description: 'Partner name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Logo URL', required: false })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiProperty({ description: 'Partner website URL', required: false })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ description: 'Sort order for display', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number;

  @ApiProperty({ description: 'Whether the partner is active', required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
