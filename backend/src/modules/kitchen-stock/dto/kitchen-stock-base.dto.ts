import { ApiProperty } from "@nestjs/swagger";
import { IsUUID, IsNumber, IsOptional, IsString } from "class-validator";

export class BaseKitchenStockDto {
  @ApiProperty()
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiProperty()
  @IsUUID()
  kitchen_item_id: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  total_price: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}