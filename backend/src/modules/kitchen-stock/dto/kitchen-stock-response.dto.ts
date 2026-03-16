import { ApiProperty } from '@nestjs/swagger';

export class KitchenItemRefDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() type: string;
}

export class KitchenStockResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() kitchen_item_id: string;
  @ApiProperty({ type: () => KitchenItemRefDto }) kitchen_item: KitchenItemRefDto;
  @ApiProperty() quantity: number;
  @ApiProperty() unit: string;
  @ApiProperty() purchase_price: number;
  @ApiProperty() purchase_date: string;
  @ApiProperty({ nullable: true }) note: string | null;
  @ApiProperty({ nullable: true }) deleted_at: Date | null;
  @ApiProperty() created_at: Date;
  @ApiProperty() updated_at: Date;
}

export class StockSummaryItemDto {
  @ApiProperty() kitchen_item_id: string;
  @ApiProperty() name: string;
  @ApiProperty() type: string;
  @ApiProperty() total_quantity: number;
  @ApiProperty() total_value: number;
  @ApiProperty({ nullable: true }) low_stock_threshold: number | null;
  @ApiProperty() is_low_stock: boolean;
}
