import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsInt,
  Min,
} from 'class-validator';

export class UpdateAdvantageDto {
  @ApiProperty({ description: 'Icon image URL', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ description: 'Advantage title', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Advantage description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Sort order for display', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number;

  @ApiProperty({ description: 'Whether the advantage is active', required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
