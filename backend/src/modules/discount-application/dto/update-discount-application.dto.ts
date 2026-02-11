import { PartialType } from '@nestjs/swagger';
import { CreateDiscountApplicationDto } from './create-discount-application.dto';

export class UpdateDiscountApplicationDto extends PartialType(CreateDiscountApplicationDto) {}