import { OmitType } from '@nestjs/swagger';
import { BaseKitchenStockDto } from './kitchen-stock-base.dto';

export class CreateKitchenStockDto extends OmitType(BaseKitchenStockDto, ['id'] as const) {}