import { OmitType } from '@nestjs/swagger';
import { BaseDiscountDto } from './base-discount.dto';

export class CreateDiscountDto extends OmitType(BaseDiscountDto, ['id'] as const) {}