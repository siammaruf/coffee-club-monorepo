import { IsNumber, IsUUID, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Item } from 'src/modules/items/entities/item.entity';
import { Order } from 'src/modules/orders/entities/order.entity';

export class OrderItemBaseDto {
  @ApiProperty({
    description: 'Order item ID',
    required: false,
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiProperty({
    description: 'Quantity of the item ordered',
    example: 2,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Price per unit of the item',
    example: 15.99,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  unit_price: number;

  @ApiProperty({
    description: 'Total price for this item',
    example: 31.98,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  total_price: number;

  @ApiProperty({
    description: 'Item details associated with this order',
    type: () => Item,
  })
  @Type(() => Item)
  item: Item;

  @IsUUID()
  @IsOptional()
  item_id?: string;

  @ApiProperty({
    description: 'Item variation ID associated with this order item',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  item_variation_id?: string;

  @ApiProperty({
    description: 'Order associated with this order item',
    type: () => Order,
    required: false,
  })
  @Type(() => Order)
  @IsOptional()
  order?: Order;

  @ApiProperty({
    description: 'Order ID associated with this order item',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  order_id?: string;

  @ApiProperty({
    description: 'Date the order item was created',
    example: '2025-06-14T12:00:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Date the order item was last updated',
    example: '2025-06-14T14:00:00.000Z',
  })
  updated_at: Date;
}