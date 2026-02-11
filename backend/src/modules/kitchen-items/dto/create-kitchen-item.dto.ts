import { OmitType } from '@nestjs/swagger';
import { BaseKitchenItemDto } from './base-kitchen-item.dto';

export class CreateKitchenItemDto extends OmitType(BaseKitchenItemDto, ['id'] as const) {}