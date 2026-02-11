import { PartialType } from '@nestjs/swagger';
import { BaseCustomerDto } from './base-customer.dto';

export class UpdateCustomerDto extends PartialType(BaseCustomerDto) {}