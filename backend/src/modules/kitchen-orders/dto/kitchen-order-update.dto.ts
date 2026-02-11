import { PartialType } from '@nestjs/swagger';
import { CreateKitchenOrderDto } from './kitchen-order-create.dto';

export class UpdateKitchenOrderDto extends PartialType(CreateKitchenOrderDto) {}