import { BaseCustomerDto } from './base-customer.dto';

export class CustomerResponseDto extends BaseCustomerDto {
    constructor(partial: Partial<CustomerResponseDto>) {
        super();
        Object.assign(this, partial);
    }
}
