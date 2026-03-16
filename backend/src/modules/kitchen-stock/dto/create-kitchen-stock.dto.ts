import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { KitchenStockUnit } from '../enum/kitchen-stock-unit.enum';
import { KitchenStockEntryType } from '../enum/kitchen-stock-entry-type.enum';

export class CreateKitchenStockDto {
  @ApiProperty({ description: 'Kitchen item ID (UUID)' })
  @IsUUID()
  @IsNotEmpty()
  kitchen_item_id: string;

  @ApiProperty({ description: 'Quantity purchased or used', example: 10 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  quantity: number;

  @ApiProperty({ enum: KitchenStockUnit, default: KitchenStockUnit.QUANTITY, required: false })
  @IsEnum(KitchenStockUnit)
  @IsOptional()
  unit?: KitchenStockUnit;

  @ApiProperty({ description: 'Purchase price per unit (0 for usage entries)', example: 250.00, required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  purchase_price?: number;

  @ApiProperty({ description: 'Purchase/usage date (YYYY-MM-DD)', example: '2026-03-16' })
  @IsDateString()
  purchase_date: string;

  @ApiProperty({ enum: KitchenStockEntryType, default: KitchenStockEntryType.PURCHASE, required: false })
  @IsEnum(KitchenStockEntryType)
  @IsOptional()
  entry_type?: KitchenStockEntryType;

  @ApiProperty({ description: 'Optional note / reason', required: false })
  @IsString()
  @IsOptional()
  note?: string;
}
