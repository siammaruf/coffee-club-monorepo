import { Exclude } from 'class-transformer';
import { BaseKitchenStockDto } from './kitchen-stock-base.dto';

@Exclude()
export class KitchenStockResponseDto extends BaseKitchenStockDto {
  constructor(partial: Partial<KitchenStockResponseDto>) {
    super();
    Object.assign(this, partial);
  }
}