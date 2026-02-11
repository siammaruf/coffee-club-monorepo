import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsEnum } from 'class-validator';
import { KitchenItemType } from '../enum/kitchen-item-type.enum';

export class BaseKitchenItemDto {
  @ApiProperty({ description: 'Kitchen item ID' })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Kitchen item name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Kitchen item name in Bengali' })
  @IsString()
  name_bn: string;

  @ApiProperty({ description: 'Kitchen item slug' })
  @IsString()
  slug: string;

  @ApiProperty({ description: 'Kitchen item image URL', required: false })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({ description: 'Kitchen item description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    description: 'Kitchen item type', 
    enum: KitchenItemType,
    default: KitchenItemType.KITCHEN
  })
  @IsEnum(KitchenItemType)
  @IsOptional()
  type?: KitchenItemType;
}