import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Order } from '../../orders/entities/order.entity';
import { OrderType } from '../../orders/enum/order-type.enum';
import { OrderStatus } from '../../orders/enum/order-status.enum';
import { PaymentMethod } from '../../orders/enum/payment-method.enum';

class OrderItemDetail {
  @ApiProperty()
  id: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unit_price: number;

  @ApiProperty()
  total_price: number;

  @ApiPropertyOptional()
  item?: {
    id: string;
    name: string;
    image: string;
    regular_price: number;
    sale_price: number;
  };

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}

class TableDetail {
  @ApiProperty()
  id: string;

  @ApiProperty()
  number: string;

  @ApiProperty()
  seat: number;

  @ApiPropertyOptional()
  status?: string;
}

export class CustomerOrderResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  order_id: string;

  @ApiProperty({ enum: OrderType })
  order_type: OrderType;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiPropertyOptional({ enum: PaymentMethod })
  payment_method?: PaymentMethod;

  @ApiProperty()
  sub_total: number;

  @ApiProperty()
  total_amount: number;

  @ApiProperty()
  discount_amount: number;

  @ApiPropertyOptional()
  delivery_address?: string;

  @ApiPropertyOptional()
  special_instructions?: string;

  @ApiPropertyOptional()
  order_source?: string;

  @ApiProperty({ type: [OrderItemDetail] })
  order_items: OrderItemDetail[];

  @ApiPropertyOptional({ type: [TableDetail] })
  tables?: TableDetail[];

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  constructor(order: Order) {
    this.id = order.id;
    this.order_id = order.order_id;
    this.order_type = order.order_type;
    this.status = order.status;
    this.payment_method = order.payment_method;
    this.sub_total = Number(order.sub_total);
    this.total_amount = Number(order.total_amount);
    this.discount_amount = Number(order.discount_amount);
    this.delivery_address = order.delivery_address;
    this.special_instructions = order.special_instructions;
    this.order_source = order.order_source;
    this.order_items =
      order.orderItems?.map((orderItem) => ({
        id: orderItem.id,
        quantity: orderItem.quantity,
        unit_price: Number(orderItem.unit_price),
        total_price: Number(orderItem.total_price),
        item: orderItem.item
          ? {
              id: orderItem.item.id,
              name: orderItem.item.name,
              image: orderItem.item.image,
              regular_price: Number(orderItem.item.regular_price),
              sale_price: Number(orderItem.item.sale_price),
            }
          : undefined,
        created_at: orderItem.created_at,
        updated_at: orderItem.updated_at,
      })) || [];
    this.tables =
      order.tables?.map((table) => ({
        id: table.id,
        number: table.number,
        seat: table.seat,
        status: table.status,
      })) || [];
    this.created_at = order.created_at;
    this.updated_at = order.updated_at;
  }
}
