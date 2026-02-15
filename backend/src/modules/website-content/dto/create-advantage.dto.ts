import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
} from 'class-validator';

export class CreateAdvantageDto {
  @ApiProperty({ description: 'Icon image URL', required: false, example: '/img/icon_1.png' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ description: 'Advantage title', example: 'Quality Foods' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Advantage description', example: 'Sit amet, consectetur adipiscing elit eiusmod tempor incididunt ut labore et dolore.' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Sort order for display', required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number;

  @ApiProperty({ description: 'Whether the advantage is active', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
