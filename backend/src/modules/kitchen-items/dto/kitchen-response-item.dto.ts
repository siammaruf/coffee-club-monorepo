import { BaseKitchenItemDto } from './base-kitchen-item.dto';

export class KitchenResponseDto extends BaseKitchenItemDto {
  constructor(partial: Partial<KitchenResponseDto>) {
    super();
    Object.assign(this, partial);
  }
}