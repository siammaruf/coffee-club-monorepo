import { OmitType } from '@nestjs/swagger';
import { OrderItemBaseDto } from './order-item-base.dto';

export class CreateOrderItemDto extends OmitType(OrderItemBaseDto, [
  'id',
  'created_at',
  'updated_at',
] as const) {}
