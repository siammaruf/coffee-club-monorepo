import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsArray, IsUUID } from 'class-validator';
import { DiscountApplicationType } from '../enum/discount-application-type.enum';

export class BaseDiscountApplicationDto {
  @ApiProperty({ enum: DiscountApplicationType })
  @IsEnum(DiscountApplicationType)
  @IsNotEmpty()
  discount_type: DiscountApplicationType;

  @ApiProperty({ type: String, description: 'Discount UUID' })
  @IsUUID()
  @IsNotEmpty()
  discount: string;

  @ApiPropertyOptional({ type: [String], description: 'Customer UUIDs' })
  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  customers?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Product (Item) UUIDs' })
  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  products?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Category UUIDs' })
  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  categories?: string[];
}