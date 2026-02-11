import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({ description: 'Item ID', example: 'uuid' })
  @IsNotEmpty()
  @IsString()
  item_id: string;

  @ApiProperty({ description: 'Quantity', example: 1, minimum: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Special notes for this item', required: false })
  @IsOptional()
  @IsString()
  special_notes?: string;
}
