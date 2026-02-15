import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
} from 'class-validator';

export class CreateTestimonialDto {
  @ApiProperty({ description: 'Testimonial quote', example: 'CoffeeClub was one of the first restaurants I visited when I moved to New York.' })
  @IsNotEmpty()
  @IsString()
  quote: string;

  @ApiProperty({ description: 'Person photo URL', required: false, example: '/img/testimonial_1-200x200.jpg' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ description: 'Person name', example: 'Adam Jefferson' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Person position/title', example: 'Lawyer, New York' })
  @IsNotEmpty()
  @IsString()
  position: string;

  @ApiProperty({ description: 'Sort order for display', required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number;

  @ApiProperty({ description: 'Whether the testimonial is active', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
