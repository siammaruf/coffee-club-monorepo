import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsIn,
  Min,
} from 'class-validator';

export class CreateHeroSlideDto {
  @ApiProperty({
    description: 'Slide type',
    example: 'centered',
    enum: ['centered', 'side-text', 'bg-image'],
    default: 'centered',
  })
  @IsOptional()
  @IsString()
  @IsIn(['centered', 'side-text', 'bg-image'])
  type?: string;

  @ApiProperty({ description: 'Image URL', required: false, example: '/img/pizza_1.png' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ description: 'Slide title', example: 'CoffeeClub' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Slide subtitle', required: false })
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiProperty({ description: 'Slide heading', required: false, example: 'Making people happy' })
  @IsOptional()
  @IsString()
  heading?: string;

  @ApiProperty({ description: 'Slide description', example: 'Italian Pizza With Cherry Tomatoes and Green Basil' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Show call-to-action button', required: false, default: false })
  @IsOptional()
  @IsBoolean()
  show_cta?: boolean;

  @ApiProperty({ description: 'Use background image style', required: false, default: false })
  @IsOptional()
  @IsBoolean()
  bg_image?: boolean;

  @ApiProperty({ description: 'Sort order for display', required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number;

  @ApiProperty({ description: 'Whether the slide is active', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
