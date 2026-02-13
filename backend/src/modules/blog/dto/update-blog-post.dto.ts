import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';

export class UpdateBlogPostDto {
  @ApiProperty({ description: 'Blog post title', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Short summary/excerpt', required: false })
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiProperty({ description: 'Full content of the blog post', required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ description: 'Image URL', required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ description: 'Author name', required: false })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiProperty({ description: 'Whether the post is published', required: false })
  @IsOptional()
  @IsBoolean()
  is_published?: boolean;
}
