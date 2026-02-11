import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderTokenDto } from './create-order-token.dto';

export class UpdateOrderTokenDto extends PartialType(CreateOrderTokenDto) {}