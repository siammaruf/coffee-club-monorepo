import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';
import { ItemStatus } from '../enum/item-status.enum';

export class VariationDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  name_bn?: string;

  @ApiProperty()
  @IsNumber()
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
  sale_price?: number | null;

  @ApiProperty({ enum: ItemStatus, default: ItemStatus.AVAILABLE })
  @IsEnum(ItemStatus)
  @IsOptional()
  status?: ItemStatus;

  @ApiProperty()
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => {
    const num = parseInt(value, 10);
    return isNaN(num) ? value : num;
  })
  sort_order?: number;
}
