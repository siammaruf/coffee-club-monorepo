import { OmitType } from '@nestjs/swagger';
import { BaseOrderDto } from '../dto/base-order.dto';

export class CreateOrderDto extends OmitType(BaseOrderDto, ['id', 'created_at', 'updated_at'] as const) {}