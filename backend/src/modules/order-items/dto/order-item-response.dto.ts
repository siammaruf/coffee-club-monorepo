import { OrderItemBaseDto } from './order-item-base.dto';

export class OrderItemResponseDto extends OrderItemBaseDto {
  constructor(partial: Partial<OrderItemResponseDto>) {
        super();
        Object.assign(this, partial);
    }
}
