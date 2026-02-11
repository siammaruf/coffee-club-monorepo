import { OrderTokenResponseDto } from 'src/modules/order-tokens/dto/order-token-response.dto';
import { BaseOrderDto } from '../dto/base-order.dto';
import { Order } from '../entities/order.entity';
import { TokenType } from 'src/modules/order-tokens/enum/TokenType.enum';

export class OrderResponseDto extends BaseOrderDto {
  constructor(order: Order) {
    super();
    
    this.id = order.id;
    this.order_type = order.order_type;
    this.order_id = order.order_id;
    this.customer = order.customer;
    this.tables = order.tables;
    this.discount = order.discount;
    this.order_items = order.orderItems?.map(orderItem => ({
      id: orderItem.id,
      quantity: orderItem.quantity,
      unit_price: orderItem.unit_price,
      total_price: orderItem.total_price,
      item: orderItem.item,
      created_at: orderItem.created_at,
      updated_at: orderItem.updated_at
    })) || [];
    // Group order tokens by type
    if (order.orderTokens && order.orderTokens.length > 0) {
      const tokensByType = order.orderTokens.reduce((acc, token) => {
        const tokenDto = new OrderTokenResponseDto(token);
        if (token.token_type === TokenType.BAR) {
          acc.bar = tokenDto;
        } else if (token.token_type === TokenType.KITCHEN) {
          acc.kitchen = tokenDto;
        }
        return acc;
      }, { bar: null, kitchen: null } as { bar: OrderTokenResponseDto | null, kitchen: OrderTokenResponseDto | null });
      
      this.order_tokens = tokensByType;
    }
    
    this.user = order.user!; 
    this.status = order.status;
    this.payment_method = order.payment_method;
    this.total_amount = Number(order.total_amount);
    this.sub_total = Number(order.sub_total);
    this.discount_amount = Number(order.discount_amount);
    this.created_at = order.created_at;
    this.updated_at = order.updated_at;
  }
}