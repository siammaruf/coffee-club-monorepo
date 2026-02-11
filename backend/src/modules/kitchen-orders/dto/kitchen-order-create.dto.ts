import { OmitType } from '@nestjs/swagger';
import { BaseKitchenOrderDto } from './kitchen-order-base.dto';

export class CreateKitchenOrderDto extends OmitType(BaseKitchenOrderDto, ['id'] as const) {}