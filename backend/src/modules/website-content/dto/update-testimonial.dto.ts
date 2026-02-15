import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsInt,
  Min,
} from 'class-validator';

export class UpdateTestimonialDto {
  @ApiProperty({ description: 'Testimonial quote', required: false })
  @IsOptional()
  @IsString()
  quote?: string;

  @ApiProperty({ description: 'Person photo URL', required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ description: 'Person name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Person position/title', required: false })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiProperty({ description: 'Sort order for display', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number;

  @ApiProperty({ description: 'Whether the testimonial is active', required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
