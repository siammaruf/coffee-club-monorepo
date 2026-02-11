import { OrderTokenPriority } from "../enum/OrderTokenPriority.enum";
import { OrderTokenStatus } from "../enum/OrderTokenStatus.enum";
import { TokenType } from "../enum/TokenType.enum";
import { OrderItemResponseDto } from "src/modules/order-items/dto/order-item-response.dto";

export class OrderTokenResponseDto {
  id: string;
  token: string;
  token_type: TokenType;
  orderId: string;
  order_items: OrderItemResponseDto[];
  priority: OrderTokenPriority;
  status: OrderTokenStatus;
  createdAt: Date;
  updatedAt: Date;
  readyAt?: Date;

  constructor(entity: any) {
    this.id = entity.id;
    this.token = entity.token;
    this.token_type = entity.token_type;
    this.orderId = entity.order?.id || entity.orderId;
    this.order_items = Array.isArray(entity.order_items) 
  ? entity.order_items.map((item: any) => {
      const dto = new OrderItemResponseDto({
        id: item.id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        item: item.item,
      });
      return dto;
    }) 
  : [];
    this.priority = entity.priority;
    this.status = entity.status;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
    this.readyAt = entity.readyAt;
  }
}