import { ApiProperty } from "@nestjs/swagger";
import { IsUUID, IsString, IsOptional } from "class-validator";

export class BaseCategoryDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty({ example: 'Beverages', description: 'Category name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'পানীয়', description: 'Category name in Bengali' })
  @IsString()
  name_bn: string;

  @ApiProperty({ example: 'beverages', description: 'Category slug' })  
  @IsString()
  slug: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, example: 'cafe-outline', description: 'Ionicon name' })
  @IsOptional()
  @IsString()
  icon?: string;
}