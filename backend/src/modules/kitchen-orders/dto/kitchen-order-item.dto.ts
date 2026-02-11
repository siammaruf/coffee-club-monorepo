import { ApiProperty } from "@nestjs/swagger";
import { IsUUID, IsNumber, IsPositive, IsOptional } from "class-validator";

export class KitchenOrderItemDto {
  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiProperty()
  @IsUUID()
  kitchen_stock_id: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  unit_price?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  total_price?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  created_at?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  updated_at?: Date;
}