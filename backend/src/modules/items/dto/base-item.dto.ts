import { ApiProperty } from "@nestjs/swagger";
import { IsUUID, IsString, IsEnum, IsNumber, IsArray, ValidateNested, IsOptional, IsPositive, IsBoolean } from "class-validator";
import { ItemType } from "../enum/item-type.enum";
import { Category } from "src/modules/categories/entities/category.entity";
import { Type, Transform, plainToInstance } from "class-transformer";
import { ItemStatus } from "../enum/item-status.enum";
import { VariationDto } from "./variation.dto";

export class BaseItemDto {
  @ApiProperty()
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  name_bn: string;

  @ApiProperty({ description: 'URL-friendly version of the name (auto-generated if not provided)' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({ enum: ItemType, default: ItemType.BAR })
  @IsEnum(ItemType)
  type: ItemType;

  @ApiProperty({ enum: ItemStatus, default: ItemStatus.AVAILABLE })
  @IsEnum(ItemStatus)
  status: ItemStatus;

  @ApiProperty()
  @IsNumber()
  @IsPositive({ message: 'Regular price must be a positive number' })
  @Transform(({ value }) => {
    const num = parseFloat(value);
    return isNaN(num) ? value : num;
  })
  regular_price: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => {
    const num = parseFloat(value);
    return isNaN(num) ? value : num;
  })
  sale_price: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({ description: 'Whether this item has variations' })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  has_variations?: boolean;

  @ApiProperty({
    description: 'Categories associated with this item',
    type: () => [Category],
    isArray: true
  })
  @IsArray({ message: 'Categories must be an array' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value.split(',').map(id => id.trim()).filter(id => id);
      }
    }
    return Array.isArray(value) ? value : [value];
  })
  categories?: Category[];

  @ApiProperty({ description: 'Item variations', type: () => [VariationDto], isArray: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') {
      try { value = JSON.parse(value); } catch { return value; }
    }
    if (!Array.isArray(value)) value = [value];
    return value.map(v => plainToInstance(VariationDto, v));
  })
  @Type(() => VariationDto)
  variations?: VariationDto[];
}
