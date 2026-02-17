import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateBlogPostDto {
  @ApiProperty({ description: 'Blog post title', example: 'Our New Espresso Blend' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Short summary/excerpt', example: 'Discover our latest single-origin espresso...' })
  @IsNotEmpty()
  @IsString()
  excerpt: string;

  @ApiProperty({ description: 'Full content of the blog post', example: '<p>Full article content here...</p>' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ description: 'Image URL', required: false, example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ description: 'Author name', example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  author: string;

  @ApiProperty({ description: 'Whether the post is published', required: false, default: false })
  @IsOptional()
  @IsBoolean()
  is_published?: boolean;
}
