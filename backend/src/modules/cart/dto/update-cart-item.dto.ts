import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({ description: 'Quantity (set to 0 to remove)', required: false, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiProperty({ description: 'Special notes for this item', required: false })
  @IsOptional()
  @IsString()
  special_notes?: string;
}
