import { OmitType } from '@nestjs/swagger';
import { KitchenOrderItemDto } from './kitchen-order-item.dto';

export class CreateKitchenOrderItemDto extends OmitType(KitchenOrderItemDto, [
  'id',
  'created_at',
  'updated_at',
] as const) {}