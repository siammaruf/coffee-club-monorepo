import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateKitchenStockDto {
  @ApiProperty({ description: 'Kitchen item ID (UUID)' })
  @IsUUID()
  @IsNotEmpty()
  kitchen_item_id: string;

  @ApiProperty({ description: 'Quantity purchased', example: 10 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({ description: 'Purchase price per unit', example: 250.00 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  purchase_price: number;

  @ApiProperty({ description: 'Purchase date (YYYY-MM-DD)', example: '2026-03-16' })
  @IsDateString()
  purchase_date: string;

  @ApiProperty({ description: 'Optional note', required: false })
  @IsString()
  @IsOptional()
  note?: string;
}
