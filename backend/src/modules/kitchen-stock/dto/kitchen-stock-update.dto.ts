import { PartialType } from '@nestjs/swagger';
import { CreateKitchenStockDto } from './kitchen-stock-create.dto';

export class UpdateKitchenStockDto extends PartialType(CreateKitchenStockDto) {}