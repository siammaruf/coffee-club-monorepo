import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsInt,
  IsIn,
  Min,
} from 'class-validator';

export class UpdateHeroSlideDto {
  @ApiProperty({
    description: 'Slide type',
    required: false,
    enum: ['centered', 'side-text', 'bg-image'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['centered', 'side-text', 'bg-image'])
  type?: string;

  @ApiProperty({ description: 'Image URL', required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ description: 'Slide title', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Slide subtitle', required: false })
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiProperty({ description: 'Slide heading', required: false })
  @IsOptional()
  @IsString()
  heading?: string;

  @ApiProperty({ description: 'Slide description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Show call-to-action button', required: false })
  @IsOptional()
  @IsBoolean()
  show_cta?: boolean;

  @ApiProperty({ description: 'Use background image style', required: false })
  @IsOptional()
  @IsBoolean()
  bg_image?: boolean;

  @ApiProperty({ description: 'Sort order for display', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number;

  @ApiProperty({ description: 'Whether the slide is active', required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
