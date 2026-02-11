import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class BaseExpenseCategoryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'The name of the expense category', example: 'Office Supplies' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'URL-friendly version of the name', example: 'office-supplies' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({ description: 'Additional details about the category', example: 'All expenses related to office materials and supplies' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Icon for visual representation', example: 'office_box' })
  @IsString()
  @IsOptional()
  icon?: string;
}