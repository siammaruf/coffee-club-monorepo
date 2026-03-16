import { PartialType } from '@nestjs/swagger';
import { CreateKitchenStockDto } from './create-kitchen-stock.dto';

export class UpdateKitchenStockDto extends PartialType(CreateKitchenStockDto) {}
